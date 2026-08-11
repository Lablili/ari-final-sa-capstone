using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ari_final_sa_capstone.Data;
using ari_final_sa_capstone.Models;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;

namespace ari_final_sa_capstone.Controllers
{
    [Authorize(Roles = "SuperAdmin,BantayDagatAdmin,FisheriesAdmin")]
    [Route("api/[controller]")]
    [ApiController]
    public class AdminChatController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        private readonly UserManager<ApplicationUser> _userManager;

        public AdminChatController(ApplicationDbContext db, UserManager<ApplicationUser> userManager)
        {
            _db = db;
            _userManager = userManager;
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetChatHistory([FromQuery] string query = "", [FromQuery] int take = 50)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var messagesQuery = _db.AdminMessages
                .Include(m => m.Sender)
                .Include(m => m.Attachments)
                .AsQueryable();

            if (!string.IsNullOrEmpty(query))
            {
                messagesQuery = messagesQuery.Where(m => m.MessageContent.Contains(query));
            }

            var messages = await messagesQuery
                .OrderByDescending(m => m.Timestamp)
                .Take(take)
                .Select(m => new
                {
                    id = m.MessageID,
                    senderId = m.SenderAdminID,
                    senderName = m.Sender != null ? m.Sender.FullName : "Unknown",
                    senderRole = m.SenderRole,
                    content = m.MessageContent,
                    type = m.MessageType,
                    timestamp = m.Timestamp,
                    isRead = m.IsRead,
                    attachments = m.Attachments.Select(a => new { a.ResourceType, a.ResourceID, a.ResourceTitle })
                })
                .ToListAsync();

            // Return in chronological order
            messages.Reverse();
            
            return Ok(messages);
        }

        [HttpGet("unreadCount")]
        public async Task<IActionResult> GetUnreadCount()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var count = await _db.AdminMessages
                .Where(m => !m.IsRead && m.SenderAdminID != user.Id)
                .CountAsync();

            return Ok(new { count });
        }

        [HttpPost("markRead")]
        public async Task<IActionResult> MarkAsRead()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            // Mark all messages not sent by this user as read
            var unreadMessages = await _db.AdminMessages
                .Where(m => !m.IsRead && m.SenderAdminID != user.Id)
                .ToListAsync();

            if (unreadMessages.Any())
            {
                var now = DateTime.UtcNow;
                foreach (var msg in unreadMessages)
                {
                    msg.IsRead = true;
                    msg.ReadTimestamp = now;
                }
                await _db.SaveChangesAsync();
            }

            return Ok(new { success = true });
        }
        [HttpGet("resources")]
        public async Task<IActionResult> GetResources([FromQuery] string type = "ALL")
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var resources = new List<object>();

            if (type == "ALL" || type == "INCIDENT")
            {
                var incidents = await _db.BlotterReports
                    .OrderByDescending(b => b.IncidentDate)
                    .Select(b => new {
                        id = b.IncidentId.ToString(),
                        type = "INCIDENT",
                        title = $"Incident: {b.IncidentType} at {b.Location}",
                        date = b.IncidentDate
                    })
                    .ToListAsync();
                resources.AddRange(incidents);
            }

            if (type == "ALL" || type == "ANNOUNCEMENT")
            {
                var announcements = await _db.Announcements
                    .OrderByDescending(a => a.Date)
                    .Select(a => new {
                        id = a.Id.ToString(),
                        type = "ANNOUNCEMENT",
                        title = $"Announcement: {a.Title}",
                        date = a.Date
                    })
                    .ToListAsync();
                resources.AddRange(announcements);
            }

            if (type == "ALL" || type == "FISHERFOLK")
            {
                var fisherfolks = await _db.FisherfolkRegistries
                    .OrderByDescending(f => f.Id)
                    .Select(f => new {
                        id = f.Id.ToString(),
                        type = "FISHERFOLK",
                        title = $"Fisherfolk: {f.Fname} {f.Lname}",
                        date = DateTime.MinValue
                    })
                    .ToListAsync();
                resources.AddRange(fisherfolks);
            }

            return Ok(resources);
        }
    }
}

