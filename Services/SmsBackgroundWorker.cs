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

namespace ari_final_sa_capstone.Services
{
    public class SmsBackgroundWorker : BackgroundService
    {
        private readonly ILogger<SmsBackgroundWorker> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly IHubContext<SmsProgressHub> _hubContext;

        // Configuration
        private const string SerialPortName = "COM3"; // Change based on Arduino
        private const int BaudRate = 9600;
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
                _isMockMode = false;
                _logger.LogInformation($"Successfully connected to Arduino on {SerialPortName}");
            }
            catch (Exception ex)
            {
                _isMockMode = true;
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
                    InitializeSerialPort();
                }

                await Task.Delay(2000, stoppingToken);
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
            var fisherfolk = await db.Fisherfolks
                .FirstOrDefaultAsync(f => f.ContactNumber == phoneNumber || f.ContactNumber == "+63" + phoneNumber.TrimStart('0'));

            string senderName = fisherfolk != null ? $"{fisherfolk.FirstName} {fisherfolk.LastName}" : "Unregistered Sender";
            string barangay = fisherfolk?.Barangay ?? "Unknown";

            // 2. Parse Category from Hardcoded Dictionary
            string category = DetermineCategory(messageText);

            // 3. Create Blotter / Incident
            var newIncident = new Blotter
            {
                Complainant = senderName,
                Category = category,
                Description = messageText,
                DateOfIncident = DateTime.Now,
                Status = "Pending",
                Notes = $"Auto-generated from SMS. Phone: {phoneNumber}, Barangay: {barangay}"
            };

            db.Blotters.Add(newIncident);

            // 4. Also log to SMS Logs for history
            var smsLog = new SMSLog
            {
                PhoneNumber = phoneNumber,
                MessageType = messageText,
                Direction = "INBOUND",
                Status = "RECEIVED",
                TimestampReceived = DateTime.Now
            };
            db.SMSLogs.Add(smsLog);

            await db.SaveChangesAsync();
            _logger.LogInformation($"Incoming SMS Processed: {category} from {senderName}");

            // 5. Trigger Dashboard Update via SignalR 
            if (_hubContext != null)
            {
                await _hubContext.Clients.All.SendAsync("NewIncidentReported", newIncident.BlotterId);
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
                .Where(s => s.Status == "PENDING" && s.Direction != "INBOUND")
                .OrderBy(s => s.SmsId)
                .Take(5)
                .ToListAsync();

            if (!pendingLogs.Any())
                return;

            foreach (var log in pendingLogs)
            {
                try
                {
                    bool success = SendSmsViaArduino(log.PhoneNumber, log.MessageType);
                    
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
                // Send command to Arduino
                _serialPort.WriteLine($"SEND:{phoneNumber}:{message}");
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
            
            await _hubContext.Clients.Group($"Announcement_{announcementId}").SendAsync("ReceiveProgress", new
            {
                AnnouncementId = announcementId, Total = total, Delivered = delivered,
                Failed = failed, Pending = pending, Percent = percent
            });
        }
    }
}
