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
            public string Category { get; set; } = string.Empty;
            public string Title { get; set; } = string.Empty;
            public string Message { get; set; } = string.Empty;
            public string RecipientGroup { get; set; } = string.Empty;
            public string Location { get; set; } = string.Empty;
            public string EffectiveDate { get; set; } = string.Empty;
            public string Penalty { get; set; } = string.Empty;
            public string ReferenceNo { get; set; } = string.Empty;
            public string Officer { get; set; } = string.Empty;
            public string ContactPerson { get; set; } = string.Empty;
            public DateTime? EventDate { get; set; }
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendAnnouncement([FromForm] CreateAnnouncementDto dto)
        {
            if (string.IsNullOrWhiteSpace(dto.Message))
            {
                return BadRequest("Message is required.");
            }

            string attachmentPath = string.Empty;

            // 1. Create the Announcement record
            var announcement = new Announcement
            {
                Category = dto.Category ?? "Custom",
                Title = dto.Title ?? string.Empty,
                RecepientGroup = dto.RecipientGroup,
                Location = dto.Location ?? string.Empty,
                Message = dto.Message,
                EffectiveDate = dto.EffectiveDate ?? string.Empty,
                Penalty = dto.Penalty ?? string.Empty,
                ResoNo = dto.ReferenceNo ?? string.Empty,
                Officer = dto.Officer ?? string.Empty,
                ContactPerson = dto.ContactPerson ?? string.Empty,
                EventDate = dto.EventDate,
                AttachmentPath = attachmentPath,
                CreatedAt = DateTime.Now,
                Status = "PENDING"
            };

            _context.Announcements.Add(announcement);
            await _context.SaveChangesAsync();

            // 2. Retrieve list of registered fisherfolk phone numbers
            // Filter by RecipientGroup if needed, but for now just all or mock logic.
            // In a real app we'd filter by barangay etc.
            var recipientsQuery = _context.FisherfolkRegistries.Where(f => f.RegistrationStatus == "Active").AsQueryable();
            if (dto.RecipientGroup == "north")
            {
                recipientsQuery = recipientsQuery.Where(f => f.Barangay == "Sulangan");
            }
            else if (dto.RecipientGroup == "south")
            {
                recipientsQuery = recipientsQuery.Where(f => f.Barangay == "Patao");
            }
            else if (dto.RecipientGroup == "licensed")
            {
                recipientsQuery = recipientsQuery.Where(f => f.Barangay == "Guiwanon");
            }

            var phoneNumbers = await recipientsQuery
                .Where(f => !string.IsNullOrEmpty(f.ContactNumber))
                .Select(f => f.ContactNumber)
                .Distinct()
                .ToListAsync();

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
    }
}

