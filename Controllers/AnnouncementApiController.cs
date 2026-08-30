using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ari_final_sa_capstone.Data;
using ari_final_sa_capstone.Models;
using System.Collections.Generic;

namespace ari_final_sa_capstone.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AnnouncementApiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AnnouncementApiController(ApplicationDbContext context)
        {
            _context = context;
        }

        public class CreateAnnouncementDto
        {
            public string? Category { get; set; }
            public string? Title { get; set; }
            public string? Message { get; set; }
            public string? RecipientGroup { get; set; }
            public string? Location { get; set; }
            public string? EffectiveDate { get; set; }
            public string? Penalty { get; set; }
            public string? ReferenceNo { get; set; }
            public string? Officer { get; set; }
            public string? ContactPerson { get; set; }
            public string? EventDate { get; set; }
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendAnnouncement([FromForm] CreateAnnouncementDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Message))
            {
                return BadRequest("Message is required.");
            }

            string attachmentPath = string.Empty;

            // The Javascript frontend already formats the message perfectly and limits it to 160 characters.
            // We just need to take it directly, and replace any line breaks just in case.
            string formattedMessage = dto.Message.Replace("\r", " ").Replace("\n", " ");
            
            // Just double checking we don't exceed the 160 char SMS limit or the SIM900 will throw ERROR
            if (formattedMessage.Length > 160)
            {
                formattedMessage = formattedMessage.Substring(0, 160);
            }

            DateTime? parsedEventDate = null;
            if (!string.IsNullOrWhiteSpace(dto.EventDate) && DateTime.TryParse(dto.EventDate, out var dt))
            {
                parsedEventDate = dt;
            }

            // 1. Create the Announcement record
            var announcement = new Announcement
            {
                Category = dto.Category ?? "Custom",
                Title = dto.Title ?? string.Empty,
                RecepientGroup = dto.RecipientGroup ?? string.Empty,
                Location = dto.Location ?? string.Empty,
                Message = formattedMessage,
                EffectiveDate = dto.EffectiveDate ?? string.Empty,
                Penalty = dto.Penalty ?? string.Empty,
                ResoNo = dto.ReferenceNo ?? string.Empty,
                Officer = dto.Officer ?? string.Empty,
                ContactPerson = dto.ContactPerson ?? string.Empty,
                EventDate = parsedEventDate,
                AttachmentPath = attachmentPath,
                CreatedAt = DateTime.Now,
                Status = "PENDING"
            };

            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync();

            // 2. Retrieve list of registered fisherfolk phone numbers based on group
            List<string> phoneNumbers;
            if (dto.RecipientGroup == "all")
            {
                phoneNumbers = await _context.FisherfolkRegistries
                    .Select(f => f.ContactNumber)
                    .ToListAsync();
            }
            else
            {
                string targetBarangay = dto.RecipientGroup switch
                {
                    "north" => "Sulangan",
                    "south" => "Patao",
                    "licensed" => "Guiwanon",
                    _ => dto.RecipientGroup
                };
                
                phoneNumbers = await _context.FisherfolkRegistries
                    .Where(f => f.Barangay == targetBarangay)
                    .Select(f => f.ContactNumber)
                    .ToListAsync();
            }
            
            // Clean up the phone numbers (remove nulls, empty strings)
            phoneNumbers = phoneNumbers.Where(p => !string.IsNullOrWhiteSpace(p)).Distinct().ToList();

            if (!phoneNumbers.Any())
            {
                return BadRequest("No valid phone numbers found for the selected group.");
            }

            // 3. Create SMS queue in database
            var smsLogs = new List<SMSLog>();
            foreach (var phone in phoneNumbers)
            {
                smsLogs.Add(new SMSLog
                {
                    MessageType = "Announcement",
                    PhoneNumber = phone,
                    Status = "PENDING",
                    TimestampSent = DateTime.Now,
                    AnnouncementId = announcement.Id,
                    RetryCount = 0
                });
            }

            _context.SMSLogs.AddRange(smsLogs);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                QueueId = announcement.Id,
                Message = dto.Message,
                Recipients = phoneNumbers.Count,
                Status = "PENDING"
            });
        }
        [HttpGet("history")]
        public async Task<IActionResult> GetHistory()
        {
            var announcements = await _context.Announcements
                .OrderByDescending(a => a.CreatedAt)
                .Select(a => new
                {
                    id = "ann-" + a.Id,
                    template = a.Category == "Ordinance/Resolution" ? "ordinance" : (a.Category == "Meeting/Events" ? "meeting" : "custom"),
                    recipientGroup = a.RecepientGroup,
                    title = a.Title,
                    location = a.Location,
                    effectiveDate = a.EffectiveDate,
                    penalty = a.Penalty,
                    referenceNo = a.ResoNo,
                    eventDate = a.EventDate.HasValue ? a.EventDate.Value.ToString("yyyy-MM-ddTHH:mm") : "",
                    contactPerson = a.ContactPerson,
                    details = a.Message,
                    message = a.Message,
                    status = a.Status == "PENDING" ? "Processing" : (a.Status == "DELIVERED" ? "Delivered" : a.Status),
                    createdAt = a.CreatedAt.ToString("o"),
                    deliveredCount = _context.SMSLogs.Count(s => s.AnnouncementId == a.Id && s.Status == "DELIVERED"),
                    archived = false
                })
                .ToListAsync();

            return Ok(announcements);
        }
    }
}

