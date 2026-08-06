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

namespace ari_final_sa_capstone.Services
{
    public class SmsBackgroundWorker : BackgroundService
    {
        private readonly ILogger<SmsBackgroundWorker> _logger;
        private readonly IServiceProvider _serviceProvider;
        private readonly IHubContext<SmsProgressHub> _hubContext;

        // Note: Change this to your Arduino's actual COM port (e.g., "COM3")
        private const string SerialPortName = "COM3"; 
        private const int BaudRate = 9600;

        public SmsBackgroundWorker(
            ILogger<SmsBackgroundWorker> logger,
            IServiceProvider serviceProvider,
            IHubContext<SmsProgressHub> hubContext)
        {
            _logger = logger;
            _serviceProvider = serviceProvider;
            _hubContext = hubContext;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("SMS Background Worker started.");

            // Poll every 2 seconds
            while (!stoppingToken.IsCancellationRequested)
            {
                await ProcessSmsQueueAsync();
                await Task.Delay(2000, stoppingToken);
            }

            _logger.LogInformation("SMS Background Worker stopping.");
        }

        private async Task ProcessSmsQueueAsync()
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            // Get pending messages (Batch of 5 to respect limits)
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
                    bool success = SendSmsViaArduino(log.PhoneNumber, log.MessageType);
                    
                    if (success)
                    {
                        log.Status = "DELIVERED";
                        log.TimestampReceived = DateTime.Now;
                    }
                    else
                    {
                        log.RetryCount++;
                        if (log.RetryCount >= 3)
                        {
                            log.Status = "FAILED";
                        }
                    }
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, $"Error sending SMS to {log.PhoneNumber}");
                    log.RetryCount++;
                    if (log.RetryCount >= 3) log.Status = "FAILED";
                }

                await db.SaveChangesAsync();

                // Broadcast progress if it's an announcement
                if (log.AnnouncementId.HasValue)
                {
                    await BroadcastProgressAsync(db, log.AnnouncementId.Value);
                }
            }
        }

        private async Task BroadcastProgressAsync(ApplicationDbContext db, int announcementId)
        {
            var logs = await db.SMSLogs
                .Where(s => s.AnnouncementId == announcementId)
                .ToListAsync();

            int total = logs.Count;
            if (total == 0) return;

            int delivered = logs.Count(s => s.Status == "DELIVERED");
            int failed = logs.Count(s => s.Status == "FAILED");
            int pending = logs.Count(s => s.Status == "PENDING");
            
            // "Sending: 245/1248 (20%)"
            int percent = (int)Math.Round((double)(delivered + failed) / total * 100);
            
            await _hubContext.Clients.Group($"Announcement_{announcementId}").SendAsync("ReceiveProgress", new
            {
                AnnouncementId = announcementId,
                Total = total,
                Delivered = delivered,
                Failed = failed,
                Pending = pending,
                Percent = percent
            });
        }

        private bool SendSmsViaArduino(string phoneNumber, string message)
        {
            try
            {
                // NOTE: If Arduino is not connected or COM port is wrong, 
                // this will throw an exception. For demo purposes, we will
                // mock the success if the port cannot be opened.
                using (SerialPort port = new SerialPort(SerialPortName, BaudRate))
                {
                    port.Open();
                    // Send command to Arduino (assuming a specific protocol, e.g., AT commands or custom string)
                    port.WriteLine($"SEND:{phoneNumber}:{message}");
                    Thread.Sleep(500); // Give it a moment to send
                    port.Close();
                    return true;
                }
            }
            catch (Exception ex)
            {
                _logger.LogWarning($"Serial Port {SerialPortName} not available. Mocking SMS send to {phoneNumber}. Error: {ex.Message}");
                // Returning true to simulate success when hardware is not plugged in during development
                return true; 
            }
        }
    }
}
