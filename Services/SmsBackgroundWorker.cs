using System;
using System.IO.Ports;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using ari_final_sa_capstone.Data;
using ari_final_sa_capstone.Hubs;
using ari_final_sa_capstone.Models;
using ari_final_sa_capstone.Controllers;

namespace ari_final_sa_capstone.Services
{
    public class SmsBackgroundWorker : BackgroundService
    {
        private readonly ILogger<SmsBackgroundWorker> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly IHubContext<SmsProgressHub> _hubContext;

        // Configuration
        private const string SerialPortName = "COM9"; // Change based on Arduino
        private const int BaudRate = 115200;
        private SerialPort _serialPort;
        private bool _isMockMode = true;

        public SmsBackgroundWorker(
            ILogger<SmsBackgroundWorker> logger,
            IServiceProvider serviceProvider,
            IHubContext<SmsProgressHub> hubContext)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
            _hubContext = hubContext;
        }

        public override Task StartAsync(CancellationToken cancellationToken)
        {
            InitializeSerialPort();
            return base.StartAsync(cancellationToken);
        }

        private void InitializeSerialPort()
        {
            try
            {
                string portToUse = SerialPortName;
                string[] availablePorts = SerialPort.GetPortNames();
                
                // If COM9 is not plugged in, let's try to auto-detect the Arduino!
                if (!availablePorts.Contains(SerialPortName) && availablePorts.Length > 0)
                {
                    // Usually the Arduino is the last COM port added to the system
                    portToUse = availablePorts.Last();
                    _logger.LogWarning($"Default {SerialPortName} not found! Auto-detecting and trying {portToUse} instead...");
                }

                _serialPort = new SerialPort(portToUse, BaudRate);
                _serialPort.DataReceived += SerialPort_DataReceived;
                _serialPort.Open();
                
                // CRITICAL FIX: Opening the serial port forces the Arduino to restart.
                // We MUST wait 5 seconds for the Arduino to finish running its setup() 
                // before we allow the background worker to start blasting SMS commands at it!
                System.Threading.Thread.Sleep(5000);
                
                _isMockMode = false;
                
                HardwareMonitor.IsConnected = true;
                HardwareMonitor.StatusMessage = $"Connected to GSM Network via {portToUse}";
                HardwareMonitor.SignalStrength = 85;
                HardwareMonitor.PortName = portToUse;

                _logger.LogInformation($"Successfully connected to Arduino on {portToUse}");
            }
            catch (Exception ex)
            {
                _isMockMode = true;
                
                HardwareMonitor.IsConnected = false;
                HardwareMonitor.StatusMessage = $"Disconnected (Mock Mode). Error: {ex.Message}";
                HardwareMonitor.SignalStrength = 0;
                HardwareMonitor.PortName = "N/A";

                _logger.LogWarning($"Could not open COM port. Running in MOCK MODE. Error: {ex.Message}");
            }
        }

        public override void Dispose()
        {
            if (_serialPort != null)
            {
                if (_serialPort.IsOpen) _serialPort.Close();
                _serialPort.Dispose();
            }
            base.Dispose();
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("SMS Background Worker started.");

            // Loop to handle outbound queue and attempt reconnects if needed
            while (!stoppingToken.IsCancellationRequested)
            {
                await ProcessSmsQueueAsync();
                
                // Attempt to reconnect if port got closed or if we started in mock mode but want to find a port
                if ((!_isMockMode && _serialPort != null && !_serialPort.IsOpen) || 
                    (_isMockMode && SerialPort.GetPortNames().Length > 0))
                {
                    _logger.LogWarning("Serial port disconnected or in Mock Mode. Attempting to connect...");
                    
                    HardwareMonitor.IsConnected = false;
                    HardwareMonitor.StatusMessage = "Disconnected. Attempting to reconnect...";
                    HardwareMonitor.SignalStrength = 0;
                    
                    InitializeSerialPort();
                }

                await Task.Delay(5000, stoppingToken);
            }

            _logger.LogInformation("SMS Background Worker stopping.");
        }

        // ==========================================
        // 1. LISTENING FOR INCOMING TEXTS
        // ==========================================
        private string _lastSenderPhone = "";
        private string _serialBuffer = "";
        private readonly object _serialLock = new object();
        
        private async void SerialPort_DataReceived(object sender, SerialDataReceivedEventArgs e)
        {
            try
            {
                SerialPort sp = (SerialPort)sender;
                string newBytes = sp.ReadExisting();
                
                lock (_serialLock)
                {
                    _serialBuffer += newBytes;
                }

                // Process complete lines
                while (true)
                {
                    string lineToProcess = null;
                    
                    lock (_serialLock)
                    {
                        int newlineIdx = _serialBuffer.IndexOf('\n');
                        if (newlineIdx >= 0)
                        {
                            lineToProcess = _serialBuffer.Substring(0, newlineIdx).Trim();
                            _serialBuffer = _serialBuffer.Substring(newlineIdx + 1);
                        }
                    }

                    if (lineToProcess == null) break;

                    string indata = lineToProcess;

                    // The Arduino actually prints "Phone: +639..." followed by "Message: text..."
                    if (indata.StartsWith("Phone: "))
                    {
                        _lastSenderPhone = indata.Substring(7).Trim();
                    }
                    else if (indata.StartsWith("Message: "))
                    {
                        string messageText = indata.Substring(9).Trim();
                        if (!string.IsNullOrEmpty(_lastSenderPhone))
                        {
                            await ProcessIncomingMessageAsync(_lastSenderPhone, messageText);
                            _lastSenderPhone = ""; // Reset after processing
                        }
                    }
                    else if (indata.StartsWith("RECEIVE:")) // Keeping this just in case they update the Arduino code later
                    {
                        var parts = indata.Split(new[] { ':' }, 3);
                        if (parts.Length == 3)
                        {
                            string senderPhone = parts[1].Trim();
                            string messageText = parts[2].Trim();

                            await ProcessIncomingMessageAsync(senderPhone, messageText);
                        }
                    }
                    else if (indata.StartsWith("SENT:"))
                    {
                        string phone = indata.Substring(5).Trim();
                        await UpdateSmsStatusAsync(phone, "DELIVERED");
                        _logger.LogInformation($"[SMS GATEWAY] Confirmed DELIVERED to {phone}");
                    }
                    else if (indata.StartsWith("FAILED:"))
                    {
                        string phone = indata.Substring(7).Trim();
                        await UpdateSmsStatusAsync(phone, "FAILED");
                        _logger.LogWarning($"[SMS GATEWAY] FAILED to send to {phone}");
                    }
                    else if (!string.IsNullOrWhiteSpace(indata))
                    {
                        // Log the Arduino's debug output directly to Visual Studio so we can see what's happening!
                        _logger.LogInformation($"[ARDUINO]: {indata}");
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reading from serial port");
            }
        }

        private async Task UpdateSmsStatusAsync(string phoneNumber, string newStatus)
        {
            try
            {
                using var scope = _serviceProvider.CreateScope();
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                
                // Find the most recent SENDING record for this phone
                var log = await db.SMSLogs
                    .Where(s => s.PhoneNumber == phoneNumber && s.Status == "SENDING")
                    .OrderByDescending(s => s.TimestampReceived)
                    .FirstOrDefaultAsync();

                if (log != null)
                {
                    if (newStatus == "FAILED")
                    {
                        log.RetryCount++;
                        log.Status = log.RetryCount >= 3 ? "FAILED" : "PENDING"; // Retry if less than 3
                    }
                    else
                    {
                        log.Status = newStatus;
                    }
                    await db.SaveChangesAsync();

                    if (log.AnnouncementId.HasValue)
                    {
                        await BroadcastProgressAsync(db, log.AnnouncementId.Value);
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Database error updating SMS status for {phoneNumber}");
            }
        }

        private async Task ProcessIncomingMessageAsync(string phoneNumber, string messageText)
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // 1. Identify Sender
            string localPhone = phoneNumber.Trim();
            if (localPhone.StartsWith("+63"))
            {
                localPhone = "0" + localPhone.Substring(3);
            }

            var fisherfolk = await db.FisherfolkRegistries
                .FirstOrDefaultAsync(f => f.ContactNumber == phoneNumber || f.ContactNumber == localPhone);

            string senderName = fisherfolk != null ? $"{fisherfolk.Fname} {fisherfolk.Lname}" : "Unregistered Sender";
            
            // Extract location from the text message itself
            string extractedLocation = AIHelper.ExtractFlaggedPlace(messageText);
            
            string barangay = extractedLocation;
            
            // If no place was mentioned in the text, fallback to the sender's registered barangay
            if ((string.IsNullOrWhiteSpace(barangay) || barangay == "Unknown") && fisherfolk != null && !string.IsNullOrWhiteSpace(fisherfolk.Barangay)) {
                barangay = fisherfolk.Barangay;
            }

            // Strictly enforce only the Barangay name (strip extra words like "River")
            if (barangay != null)
            {
                if (barangay.Contains("Sulangan", StringComparison.OrdinalIgnoreCase)) barangay = "Sulangan";
                else if (barangay.Contains("Patao", StringComparison.OrdinalIgnoreCase)) barangay = "Patao";
                else if (barangay.Contains("Guiwanon", StringComparison.OrdinalIgnoreCase)) barangay = "Guiwanon";
                else barangay = "Unknown";
            }

            if (string.IsNullOrWhiteSpace(barangay)) {
                barangay = "Unknown";
            }

            // 2. Parse Category and map to valid Javascript dictionary keys (sos, incident, complaint)
            string detectedCategory = DetermineCategory(messageText);
            string category = "incident"; // Default
            
            if (detectedCategory.Contains("Emergency") || detectedCategory.Contains("Rescue"))
            {
                category = "sos";
            }
            else if (detectedCategory.Contains("Crime") || messageText.Contains("reklamo", StringComparison.OrdinalIgnoreCase))
            {
                category = "complaint";
            }

            // 3. Create Blotter / Incident (Legacy)
            var newIncident = new BlotterReport
            {
                IncidentDate = DateTime.Now,
                IncidentType = detectedCategory,
                Location = barangay,
                ReportSource = $"SMS: {senderName} ({phoneNumber})",
                ActionsTaken = messageText,
                Outcome = "Pending",
                Status = "Open"
            };

            db.BlotterReports.Add(newIncident);

            // 3.5 Create Community Report (FeedbackMessage)
            string priority = "Medium"; 

            if (detectedCategory == "General Concern")
            {
                priority = "Low";
            }

            // Upgrade to High or Critical based on specific severe keywords / categories
            if (category == "sos") 
            {
                priority = "Critical";
            }
            else if (messageText.Contains("Illegal", StringComparison.OrdinalIgnoreCase) || 
                     messageText.Contains("dinamita", StringComparison.OrdinalIgnoreCase) ||
                     messageText.Contains("dynamite", StringComparison.OrdinalIgnoreCase)) 
            {
                priority = "High";
            }

            var feedback = new FeedbackMessage
            {
                Sender = senderName,
                Category = category,
                FlaggedPlace = barangay,
                ContactNumber = localPhone, // Always save in local format (09...) so the frontend recognizes it!
                DateReceived = DateTime.Now.Date,
                TimeReceived = DateTime.Now.TimeOfDay,
                Status = "new",
                PriorityLevel = priority,
                Subject = $"SMS: {detectedCategory}",
                Message = messageText
            };

            db.FeedbackMessages.Add(feedback);

            // 4. Also log to SMS Logs for history
            var smsLog = new SMSLog
            {
                PhoneNumber = phoneNumber,
                // MessageType has a MaxLength of 50 in the database, so we must truncate it!
                MessageType = messageText.Length > 50 ? messageText.Substring(0, 50) : messageText,
                Status = "RECEIVED",
                TimestampReceived = DateTime.Now
            };
            db.SMSLogs.Add(smsLog);

            await db.SaveChangesAsync();
            _logger.LogInformation($"Incoming SMS Processed: {category} from {senderName}");

            // 5. Trigger Dashboard Update via SignalR 
            if (_hubContext != null)
            {
                await _hubContext.Clients.All.SendAsync("NewIncidentReported", newIncident.IncidentId);
            }
        }

        private string DetermineCategory(string text)
        {
            text = text.ToUpper();

            if (text.Contains("SOS") || text.Contains("HELP") || text.Contains("TABANG") || text.Contains("RESCUE") || text.Contains("EMERGENCY") || text.Contains("LUNOD") || text.Contains("TIKYAOB") || text.Contains("GUBA") || text.Contains("MAKINA") || text.Contains("ENGIN") || text.Contains("TULIS") || text.Contains("SAKLOLO"))
            {
                return "Emergency / Rescue";
            }
            else if (text.Contains("MEDICAL") || text.Contains("OSPITAL") || text.Contains("HOSPITAL") || text.Contains("SAKIT") || text.Contains("SAMAD") || text.Contains("DUGO") || text.Contains("GIATAKE"))
            {
                return "Medical Emergency";
            }
            else if (text.Contains("REPORT") || text.Contains("REKLAMO") || text.Contains("ILLEGAL") || text.Contains("DINAMITA") || text.Contains("DYNAMITE") || text.Contains("KURYENTE") || text.Contains("HILO") || text.Contains("BALING") || text.Contains("SUDLOD") || text.Contains("BADLONGON"))
            {
                return "Illegal Fishing";
            }
            else if (text.Contains("ACCIDENT") || text.Contains("AKSIDENTE") || text.Contains("DISGRASYA") || text.Contains("BANGGA") || text.Contains("SUNOG") || text.Contains("HAZARD"))
            {
                return "Accident / Hazard";
            }
            else if (text.Contains("WEATHER") || text.Contains("PANAHON") || text.Contains("BAGYO") || text.Contains("BALOD") || text.Contains("HANGIN") || text.Contains("ULAN") || text.Contains("INFO") || text.Contains("BALITA"))
            {
                return "Weather / Inquiry";
            }

            return "General Concern";
        }

        // ==========================================
        // 2. SENDING OUTBOUND TEXTS
        // ==========================================
        private async Task ProcessSmsQueueAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var pendingLogs = await db.SMSLogs
                .Where(s => s.Status == "PENDING")
                .OrderBy(s => s.SmsId)
                .Take(5)
                .ToListAsync();

            if (!pendingLogs.Any())
                return;

            foreach (var log in pendingLogs)
            {
                try
                {
                    string textToSend = log.MessageType;
                    
                    // Manually fetch the Announcement message if there is an AnnouncementId
                    if (log.AnnouncementId.HasValue) 
                    {
                        var announcement = await db.Announcements.FindAsync(log.AnnouncementId.Value);
                        if (announcement != null && !string.IsNullOrEmpty(announcement.Message))
                        {
                            textToSend = announcement.Message;
                        }
                    }

                    // Prefix with "BANTAY DAGAT: " to act as a Sender ID workaround
                    if (!textToSend.StartsWith("BANTAY DAGAT:", StringComparison.OrdinalIgnoreCase))
                    {
                        textToSend = $"BANTAY DAGAT: {textToSend}";
                    }

                    // Fix: Set status to SENDING *before* we block, so DataReceived can find it!
                    log.Status = "SENDING";
                    log.TimestampReceived = DateTime.Now;
                    await db.SaveChangesAsync();

                    if (log.AnnouncementId.HasValue)
                    {
                        await BroadcastProgressAsync(db, log.AnnouncementId.Value);
                    }

                    bool success = await SendSmsViaArduinoAsync(log.PhoneNumber, textToSend);
                    
                    if (!success)
                    {
                        log.RetryCount++;
                        if (log.RetryCount >= 3) log.Status = "FAILED";
                        else log.Status = "PENDING";
                        await db.SaveChangesAsync();
                        
                        if (log.AnnouncementId.HasValue)
                        {
                            await BroadcastProgressAsync(db, log.AnnouncementId.Value);
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error sending SMS to {log.PhoneNumber}");
                    log.RetryCount++;
                    if (log.RetryCount >= 3) log.Status = "FAILED";
                    else log.Status = "PENDING";
                    await db.SaveChangesAsync();
                }
            }
        }

        private async Task<bool> SendSmsViaArduinoAsync(string phoneNumber, string message)
        {
            if (_isMockMode || _serialPort == null || !_serialPort.IsOpen)
            {
                // Mock Mode: Pretend it sent successfully for development testing
                _logger.LogInformation($"[MOCK SMS OUT] To: {phoneNumber}, Message: {message}");
                return true; 
            }

            try
            {
                // Sanitize phone number (remove spaces and dashes)
                string safePhone = phoneNumber.Replace(" ", "").Replace("-", "");

                // Encode newlines for our Arduino Gateway
                string encodedMessage = message.Replace("\n", "\\n");

                // Send command to Arduino using the COMMA syntax!
                string exactCommand = $"SEND,{safePhone},{encodedMessage}\n";
                _logger.LogInformation($"[SMS GATEWAY] Sending exactly: {exactCommand.Trim()}");
                
                // CRITICAL FIX: The Arduino UNO only has a 64-byte hardware serial buffer.
                // If we blast a 160-character string at once, it will overflow and truncate the message!
                // We must trickle-feed the string slowly so the Arduino has time to process it.
                foreach (char c in exactCommand)
                {
                    _serialPort.Write(c.ToString());
                    await Task.Delay(10); // 10ms per char = ~1.5 seconds for a full SMS
                }
                
                // Wait 20 seconds for the Arduino/SIM900 to finish texting over the 2G network!
                // Using Task.Delay instead of Thread.Sleep so we don't block the worker thread completely
                await Task.Delay(20000);
                
                return true;
            }
            catch (Exception ex)
            {
                _logger.LogError($"Failed to write to serial port: {ex.Message}");
                return false;
            }
        }

        private async Task BroadcastProgressAsync(ApplicationDbContext db, int announcementId)
        {
            var logs = await db.SMSLogs.Where(s => s.AnnouncementId == announcementId).ToListAsync();
            int total = logs.Count;
            if (total == 0) return;

            int delivered = logs.Count(s => s.Status == "DELIVERED");
            int failed = logs.Count(s => s.Status == "FAILED");
            int pending = logs.Count(s => s.Status == "PENDING");
            int sending = logs.Count(s => s.Status == "SENDING");
            
            // Percentage of completely finished texts
            int percent = (int)Math.Round((double)(delivered + failed) / total * 100);
            
            if (percent == 100)
            {
                var announcement = await db.Announcements.FindAsync(announcementId);
                if (announcement != null && announcement.Status != "DELIVERED")
                {
                    announcement.Status = "DELIVERED";
                    await db.SaveChangesAsync();
                }
            }

            await _hubContext.Clients.Group($"Announcement_{announcementId}").SendAsync("ReceiveProgress", new
            {
                AnnouncementId = announcementId, Total = total, Delivered = delivered,
                Failed = failed, Pending = pending, Sending = sending, Percent = percent
            });
        }
    }
}
