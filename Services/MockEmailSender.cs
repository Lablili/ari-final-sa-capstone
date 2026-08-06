using System.Threading.Tasks;
using Microsoft.Extensions.Logging;

namespace ari_final_sa_capstone.Services
{
    public class MockEmailSender : IEmailSender
    {
        private readonly ILogger<MockEmailSender> _logger;

        public MockEmailSender(ILogger<MockEmailSender> logger)
        {
            _logger = logger;
        }

        public Task SendEmailAsync(string email, string subject, string htmlMessage)
        {
            _logger.LogWarning("MOCK EMAIL SENDER ACTIVATED");
            _logger.LogWarning("-------------------------------------------------");
            _logger.LogWarning("To: {Email}", email);
            _logger.LogWarning("Subject: {Subject}", subject);
            _logger.LogWarning("Body: {HtmlMessage}", htmlMessage);
            _logger.LogWarning("-------------------------------------------------");
            
            return Task.CompletedTask;
        }
    }
}
