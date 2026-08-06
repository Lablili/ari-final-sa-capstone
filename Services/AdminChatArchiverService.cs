using System;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using ari_final_sa_capstone.Data;
using ari_final_sa_capstone.Models;

namespace ari_final_sa_capstone.Services
{
    public class AdminChatArchiverService : BackgroundService
    {
        private readonly IServiceProvider _serviceProvider;
        private readonly ILogger<AdminChatArchiverService> _logger;

        public AdminChatArchiverService(IServiceProvider serviceProvider, ILogger<AdminChatArchiverService> logger)
        {
            _serviceProvider = serviceProvider;
            _logger = logger;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            _logger.LogInformation("AdminChatArchiverService is starting.");

            while (!stoppingToken.IsCancellationRequested)
            {
                try
                {
                    await ArchiveOldMessages();
                }
                catch (Exception ex)
                {
                    _logger.LogError(ex, "Error occurred executing ArchiveOldMessages.");
                }

                // Run every 24 hours
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }

            _logger.LogInformation("AdminChatArchiverService is stopping.");
        }

        private async Task ArchiveOldMessages()
        {
            using var scope = _serviceProvider.CreateScope();
            var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();

            var thresholdDate = DateTime.UtcNow.AddDays(-30);

            var oldMessages = db.AdminMessages
                .Where(m => m.Timestamp < thresholdDate)
                .ToList();

            if (oldMessages.Any())
            {
                foreach (var msg in oldMessages)
                {
                    var archiveEntry = new AdminChatArchive
                    {
                        MessageID = msg.MessageID,
                        ConversationTopic = string.IsNullOrEmpty(msg.MessageContent) ? "No Content" : (msg.MessageContent.Length > 50 ? msg.MessageContent.Substring(0, 50) + "..." : msg.MessageContent),
                        ArchivedDate = DateTime.UtcNow,
                        ArchiveReason = "AUTO_30DAYS"
                    };
                    db.AdminChatArchives.Add(archiveEntry);
                }

                db.AdminMessages.RemoveRange(oldMessages);
                
                await db.SaveChangesAsync();
                _logger.LogInformation($"Archived {oldMessages.Count} old admin messages.");
            }
        }
    }
}
