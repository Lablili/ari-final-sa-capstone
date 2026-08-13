using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ari_final_sa_capstone.Data;
using System.Linq;
using System.Threading.Tasks;

namespace ari_final_sa_capstone.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SmsLogsApiController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public SmsLogsApiController(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet("sent")]
        public async Task<IActionResult> GetSentMessages()
        {
            // Join SMSLogs with Announcements to get the actual message content
            var sentMessages = await _db.SMSLogs
                .OrderByDescending(s => s.TimestampSent)
                .Take(200) // Limit to latest 200 for performance
                .Select(s => new
                {
                    s.Status,
                    s.PhoneNumber,
                    s.MessageType,
                    s.TimestampSent,
                    MessageContent = s.MessageType == "Announcement" && s.AnnouncementId.HasValue 
                        ? _db.Announcements.Where(a => a.Id == s.AnnouncementId.Value).Select(a => a.Message).FirstOrDefault() 
                        : "No content available"
                })
                .ToListAsync();

            return Ok(sentMessages);
        }

        [HttpGet("received")]
        public async Task<IActionResult> GetReceivedMessages()
        {
            // FeedbackMessages holds the incoming messages from fisherfolk
            var receivedMessages = await _db.FeedbackMessages
                .OrderByDescending(f => f.DateReceived)
                .Take(200)
                .Select(f => new
                {
                    Status = f.Status,
                    PhoneNumber = f.ContactNumber,
                    MessageType = f.Category ?? "Feedback",
                    TimestampSent = f.DateReceived,
                    MessageContent = f.Message
                })
                .ToListAsync();

            return Ok(receivedMessages);
        }
    }
}
