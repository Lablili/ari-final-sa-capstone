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
                _serialPort = new SerialPort(SerialPortName, BaudRate);
                _serialPort.DataReceived += SerialPort_DataReceived;
                _serialPort.Open();
                
                // CRITICAL FIX: Opening the serial port forces the Arduino to restart.
                // We MUST wait 5 seconds for the Arduino to finish running its setup() 
                // before we allow the background worker to start blasting SMS commands at it!
                System.Threading.Thread.Sleep(5000);
                
                _isMockMode = false;
                
                HardwareMonitor.IsConnected = true;
                HardwareMonitor.StatusMessage = $"Connected to GSM Network via {SerialPortName}";
                HardwareMonitor.SignalStrength = 85;
                HardwareMonitor.PortName = SerialPortName;

                _logger.LogInformation($"Successfully connected to Arduino on {SerialPortName}");
            }
            catch (Exception ex)
            {
                _isMockMode = true;
                
                HardwareMonitor.IsConnected = false;
                HardwareMonitor.StatusMessage = $"Disconnected (Mock Mode). Error: {ex.Message}";
                HardwareMonitor.SignalStrength = 0;
                HardwareMonitor.PortName = SerialPortName;

                _logger.LogWarning($"Could not open {SerialPortName}. Running in MOCK MODE. Error: {ex.Message}");
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
                
                // Attempt to reconnect if not in mock mode but port got closed
                if (!_isMockMode && _serialPort != null && !_serialPort.IsOpen)
                {
                    _logger.LogWarning("Serial port disconnected. Attempting to reconnect...");
                    
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
        private async void SerialPort_DataReceived(object sender, SerialDataReceivedEventArgs e)
        {
            try
            {
                SerialPort sp = (SerialPort)sender;
                string indata = sp.ReadLine().Trim();

                // Expecting Arduino to print: RECEIVE:09123456789:The message here
                if (indata.StartsWith("RECEIVE:"))
                {
                    var parts = indata.Split(new[] { ':' }, 3);
                    if (parts.Length == 3)
                    {
                        string senderPhone = parts[1].Trim();
                        string messageText = parts[2].Trim();

                        await ProcessIncomingMessageAsync(senderPhone, messageText);
                    }
                }
                else
                {
                    // Log the Arduino's debug output directly to Visual Studio so we can see what's happening!
                    _logger.LogInformation($"[ARDUINO]: {indata}");
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error reading from serial port");
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
            if (category == "sos") priority = "Critical";
            else if (messageText.Contains("Illegal", StringComparison.OrdinalIgnoreCase) || messageText.Contains("dinamita", StringComparison.OrdinalIgnoreCase)) priority = "High";

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
                MessageType = messageText,
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

                    bool success = SendSmsViaArduino(log.PhoneNumber, textToSend);
                    
                    if (success)
                    {
                        log.Status = "DELIVERED";
                        log.TimestampReceived = DateTime.Now;
                    }
                    else
                    {
                        log.RetryCount++;
                        if (log.RetryCount >= 3) log.Status = "FAILED";
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error sending SMS to {log.PhoneNumber}");
                    log.RetryCount++;
                    if (log.RetryCount >= 3) log.Status = "FAILED";
                }

                await db.SaveChangesAsync();

                if (log.AnnouncementId.HasValue)
                {
                    await BroadcastProgressAsync(db, log.AnnouncementId.Value);
                }
            }
        }

        private bool SendSmsViaArduino(string phoneNumber, string message)
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
                string exactCommand = $"SEND,{safePhone},{encodedMessage}";
                _logger.LogInformation($"[SMS GATEWAY] Sending exactly: {exactCommand}");
                _serialPort.WriteLine(exactCommand);
                
                // Wait 7 seconds for the Arduino to finish texting!
                System.Threading.Thread.Sleep(7000);
                
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
                Failed = failed, Pending = pending, Percent = percent
            });
        }
    }
}
