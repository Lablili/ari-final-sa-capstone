using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ari_final_sa_capstone.Data;
using ari_final_sa_capstone.Models;
using ari_final_sa_capstone.Hubs;
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

        [HttpGet("currentUser")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var roles = await _userManager.GetRolesAsync(user);
            return Ok(new
            {
                userId = user.Id,
                userName = !string.IsNullOrWhiteSpace(user.FullName) ? user.FullName : (user.UserName ?? "Admin"),
                role = roles.FirstOrDefault() ?? "Admin"
            });
        }

        [HttpGet("onlineUsers")]
        public IActionResult GetOnlineUsers()
        {
            var online = AdminChatHub.GetActiveAdminsList();
            return Ok(online);
        }

        [HttpGet("history")]
        public async Task<IActionResult> GetChatHistory([FromQuery] string query = "", [FromQuery] int take = 60)
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var messagesQuery = _db.AdminMessages
                .Include(m => m.Sender)
                .Include(m => m.Attachments)
                .AsQueryable();

            if (!string.IsNullOrWhiteSpace(query))
            {
                var q = query.Trim();
                messagesQuery = messagesQuery.Where(m => 
                    m.MessageContent.Contains(q) ||
                    (m.Sender != null && (m.Sender.FullName.Contains(q) || (m.Sender.UserName != null && m.Sender.UserName.Contains(q)))) ||
                    m.Attachments.Any(a => a.ResourceTitle.Contains(q)));
            }

            var messages = await messagesQuery
                .OrderByDescending(m => m.Timestamp)
                .Take(take)
                .Select(m => new
                {
                    id = m.MessageID,
                    senderId = m.SenderAdminID,
                    senderName = m.Sender != null && !string.IsNullOrEmpty(m.Sender.FullName) ? m.Sender.FullName : (m.Sender != null && m.Sender.UserName != null ? m.Sender.UserName : "Admin"),
                    senderRole = m.SenderRole,
                    content = m.MessageContent,
                    type = m.MessageType,
                    timestamp = m.Timestamp,
                    isRead = m.IsRead,
                    attachments = m.Attachments.Select(a => new { a.ResourceType, a.ResourceID, a.ResourceTitle })
                })
                .ToListAsync();

            // Return in chronological order (oldest first)
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
        public async Task<IActionResult> GetResources([FromQuery] string type = "ALL", [FromQuery] string search = "")
        {
            var user = await _userManager.GetUserAsync(User);
            if (user == null) return Unauthorized();

            var resources = new List<object>();
            var s = (search ?? "").Trim().ToLower();

            if (type == "ALL" || type == "INCIDENT")
            {
                var incidentsQuery = _db.BlotterReports.AsQueryable();
                if (!string.IsNullOrEmpty(s))
                {
                    incidentsQuery = incidentsQuery.Where(b => b.IncidentType.Contains(s) || b.Location.Contains(s) || (b.ReportSource != null && b.ReportSource.Contains(s)));
                }

                var incidents = await incidentsQuery
                    .OrderByDescending(b => b.IncidentDate)
                    .Take(25)
                    .Select(b => new {
                        id = b.IncidentId.ToString(),
                        type = "INCIDENT",
                        title = $"Incident: {b.IncidentType} at {b.Location}",
                        body = b.ReportSource,
                        date = b.IncidentDate
                    })
                    .ToListAsync();
                resources.AddRange(incidents);
            }

            if (type == "ALL" || type == "ANNOUNCEMENT")
            {
                var announcementsQuery = _db.Announcements.AsQueryable();
                if (!string.IsNullOrEmpty(s))
                {
                    announcementsQuery = announcementsQuery.Where(a => (a.Title != null && a.Title.Contains(s)) || a.Message.Contains(s) || a.Category.Contains(s));
                }

                var announcements = await announcementsQuery
                    .OrderByDescending(a => a.Date)
                    .Take(25)
                    .Select(a => new {
                        id = a.Id.ToString(),
                        type = "ANNOUNCEMENT",
                        title = string.IsNullOrEmpty(a.Title) ? $"Announcement: {a.Category}" : $"Announcement: {a.Title}",
                        body = a.Message,
                        date = a.Date
                    })
                    .ToListAsync();
                resources.AddRange(announcements);
            }

            if (type == "ALL" || type == "FISHERFOLK")
            {
                var fisherfolksQuery = _db.FisherfolkRegistries.AsQueryable();
                if (!string.IsNullOrEmpty(s))
                {
                    fisherfolksQuery = fisherfolksQuery.Where(f => f.Fname.Contains(s) || f.Lname.Contains(s) || (f.Address != null && f.Address.Contains(s)) || (f.ContactNumber != null && f.ContactNumber.Contains(s)));
                }

                var fisherfolks = await fisherfolksQuery
                    .OrderByDescending(f => f.Id)
                    .Take(25)
                    .Select(f => new {
                        id = f.Id.ToString(),
                        type = "FISHERFOLK",
                        title = $"Fisherfolk: {f.Fname} {f.Lname}",
                        body = $"Address: {f.Address} | Contact: {f.ContactNumber}",
                        date = DateTime.UtcNow
                    })
                    .ToListAsync();
                resources.AddRange(fisherfolks);
            }

            return Ok(resources);
        }
    }
}
