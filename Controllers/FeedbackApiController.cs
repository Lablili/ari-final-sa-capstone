using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;
using ari_final_sa_capstone.Data;
using ari_final_sa_capstone.Models;

namespace ari_final_sa_capstone.Controllers
{
    [Route("api/feedback")]
    [ApiController]
    public class FeedbackApiController : ControllerBase
    {
        private readonly ApplicationDbContext _db;

        public FeedbackApiController(ApplicationDbContext db)
        {
            _db = db;
        }

        [AllowAnonymous]
        [HttpPost("simulate")]
        public async Task<IActionResult> GenerateMockFeedback()
        {
            var random = new Random();
            var senders = new[] { "Juan Dela Cruz", "Elpidio Reyes", "Rosa Aquino", "Unknown Sender" };

            var scenarios = new[]
            {
                new { Cat = "incident", Msg = "REPORT: Dynamite fishing spotted approx 2km east of Lipayran Island. Two large blue commercial vessels encroaching our municipal waters. Please send patrol immediately." },
                new { Cat = "sos", Msg = "SOS! Engine breakdown near Sulangan reef. Boat name 'Maria Rosa'. 3 crew members onboard. Waves are getting big and we are drifting. Need immediate rescue." },
                new { Cat = "complaint", Msg = "Sir, reporting a damaged artificial reef near Brgy Patao shoreline. Looks like it was hit by a large anchor last night. Please inspect." }
            };

            var selectedScenario = scenarios[random.Next(scenarios.Length)];

            string contactNumber = $"+639{random.Next(100000000, 999999999)}";
            var registeredNumbers = await _db.FisherfolkRegistries.Select(r => r.ContactNumber).ToListAsync();
            if (registeredNumbers.Any() && random.Next(100) < 50)
            {
                contactNumber = registeredNumbers[random.Next(registeredNumbers.Count)];
            }

            var isBlocked = await _db.BlockedNumbers.AnyAsync(b => b.PhoneNumber == contactNumber && (b.BlockedUntil == null || b.BlockedUntil > DateTime.UtcNow));
            if (isBlocked) return Ok(new { success = true, ignored = true }); // Silent drop

            var mock = new FeedbackMessage
            {
                Category = selectedScenario.Cat,
                Sender = senders[random.Next(senders.Length)],
                ContactNumber = contactNumber,
                DateReceived = DateTime.UtcNow.Date,
                TimeReceived = DateTime.UtcNow.TimeOfDay,
                Status = "new",
                PriorityLevel = AIHelper.DeterminePriority(selectedScenario.Msg),
                Subject = "Simulated Hardware SMS Report",
                Message = selectedScenario.Msg,
                FlaggedPlace = AIHelper.ExtractFlaggedPlace(selectedScenario.Msg)
            };

            _db.FeedbackMessages.Add(mock);
            await _db.SaveChangesAsync();

            return Ok(new { success = true });
        }

        // GET /api/feedback  — return all records as JSON
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var records = await _db.FeedbackMessages
                .Where(f => f.GroupId == null)
                .OrderByDescending(f => f.DateReceived)
                .ThenByDescending(f => f.TimeReceived)
                .ToListAsync();

            var registeredNumbers = await _db.FisherfolkRegistries.Select(r => r.ContactNumber).ToListAsync();
            var registeredSet = new HashSet<string>(registeredNumbers);

            var result = records.Select(f => new
            {
                id = f.Id,
                cat = f.Category,
                sender = f.Sender,
                contact = f.ContactNumber,
                priority = f.PriorityLevel,
                flaggedPlace = f.FlaggedPlace,
                time = f.DateReceived.ToString("yyyy-MM-dd") + " " +
                             f.TimeReceived.ToString(@"hh\:mm"),
                status = f.Status,
                subject = f.Subject,
                msg = f.Message,
                actionedByAdmin = f.ActionedByAdmin,
                isRegistered = registeredSet.Contains(f.ContactNumber)
            });

            return Ok(result);
        }

        // POST /api/feedback  — create a new record (or bulk seed from JS array)
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] List<FeedbackCreateDto> items)
        {
            if (items == null || items.Count == 0)
                return BadRequest("No items provided.");

            foreach (var dto in items)
            {
                // Parse date and time from the combined "yyyy-MM-dd HH:mm" string
                DateTime dateReceived = DateTime.UtcNow;
                TimeSpan timeReceived = TimeSpan.Zero;

                if (DateTime.TryParse(dto.Time, out var parsed))
                {
                    dateReceived = parsed.Date;
                    timeReceived = parsed.TimeOfDay;
                }

                var isBlocked = await _db.BlockedNumbers.AnyAsync(b => b.PhoneNumber == dto.Contact && (b.BlockedUntil == null || b.BlockedUntil > DateTime.UtcNow));
                if (isBlocked) continue; // Silent drop

                var record = new FeedbackMessage
                {
                    Category = dto.Cat ?? "info",
                    Sender = dto.Sender ?? "",
                    ContactNumber = dto.Contact ?? "",
                    PriorityLevel = AIHelper.DeterminePriority(dto.Msg),
                    FlaggedPlace = AIHelper.ExtractFlaggedPlace(dto.Msg),
                    DateReceived = dateReceived,
                    TimeReceived = timeReceived,
                    Status = dto.Status ?? "new",
                    Subject = dto.Subject ?? "",
                    Message = dto.Msg ?? ""
                };

                _db.FeedbackMessages.Add(record);
            }

            await _db.SaveChangesAsync();
            return Ok(new { saved = items.Count });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var record = await _db.FeedbackMessages.FindAsync(id);
            if (record == null) return NotFound("Report not found.");

            // Check if registered
            var isRegistered = await _db.FisherfolkRegistries.AnyAsync(r => r.ContactNumber == record.ContactNumber);

            return Ok(new
            {
                id = record.Id,
                dateSent = record.DateReceived.ToString("yyyy-MM-dd") + "T" + record.TimeReceived.ToString(@"hh\:mm\:ss"),
                contact = record.ContactNumber,
                content = record.Message,
                status = record.Status,
                priority = record.PriorityLevel,
                isRegistered = isRegistered,
                actionedByAdmin = record.ActionedByAdmin,
                flaggedPlace = record.FlaggedPlace
            });
        }

        // GET /api/feedback/{id}/related  — get related reports
        [HttpGet("{id}/related")]
        public async Task<IActionResult> GetRelated(int id)
        {
            var target = await _db.FeedbackMessages.FindAsync(id);
            if (target == null) return NotFound();

            if (string.IsNullOrEmpty(target.FlaggedPlace) || target.FlaggedPlace.Contains("Unknown", StringComparison.OrdinalIgnoreCase))
            {
                return Ok(new List<object>()); // Return empty if no specific location
            }

            // Define a time window (e.g., same day, or +/- 12 hours)
            var windowStart = target.DateReceived.AddDays(-1);
            var windowEnd = target.DateReceived.AddDays(1);

            var related = await _db.FeedbackMessages
                .Where(f => f.Id != id 
                         && f.FlaggedPlace == target.FlaggedPlace
                         && f.DateReceived >= windowStart 
                         && f.DateReceived <= windowEnd)
                .OrderByDescending(f => f.DateReceived)
                .ThenByDescending(f => f.TimeReceived)
                .ToListAsync();

            var result = related.Select(f => new
            {
                id = f.Id,
                cat = f.Category,
                sender = f.Sender,
                contact = f.ContactNumber,
                priority = f.PriorityLevel,
                flaggedPlace = f.FlaggedPlace,
                time = f.DateReceived.ToString("yyyy-MM-dd") + " " + f.TimeReceived.ToString(@"hh\:mm"),
                status = f.Status,
                subject = f.Subject,
                msg = f.Message
            });

            return Ok(result);
        }

        // PATCH /api/feedback/{id}/status  — update status only
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdateDto dto)
        {
            var record = await _db.FeedbackMessages.FindAsync(id);
            if (record == null) return NotFound();

            record.Status = dto.Status ?? record.Status;
            record.ActionedByAdmin = User.Identity?.Name ?? "Admin";
            await _db.SaveChangesAsync();
            return Ok(new { id, status = record.Status, actionedByAdmin = record.ActionedByAdmin });
        }

        [HttpPost("bulk-resolve")]
        public async Task<IActionResult> BulkResolve([FromBody] List<int> ids)
        {
            if (ids == null || !ids.Any()) return BadRequest("No IDs provided.");

            var records = await _db.FeedbackMessages.Where(f => ids.Contains(f.Id)).ToListAsync();
            foreach (var record in records)
            {
                record.Status = "archived";
                record.ActionedByAdmin = User.Identity?.Name ?? "Admin";
            }
            await _db.SaveChangesAsync();
            return Ok(new { success = true, count = records.Count });
        }

        [HttpPost("{id}/merge")]
        public async Task<IActionResult> MergeGroup(int id, [FromBody] List<int> childIds)
        {
            var primary = await _db.FeedbackMessages.FindAsync(id);
            if (primary == null) return NotFound("Primary report not found.");

            if (childIds == null || !childIds.Any()) return BadRequest("No child IDs provided.");

            var children = await _db.FeedbackMessages.Where(f => childIds.Contains(f.Id) && f.Id != id).ToListAsync();
            
            foreach(var child in children)
            {
                child.GroupId = id;
                child.Status = "archived"; // hide them and consider them resolved through merge
                child.ActionedByAdmin = User.Identity?.Name ?? "Admin";
                
                // Append message to primary
                primary.Message += $"\n\n--- Additional Report from {child.ContactNumber} ---\n{child.Message}";
            }

            primary.ActionedByAdmin = User.Identity?.Name ?? "Admin";
            
            await _db.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpPost("block")]
        public async Task<IActionResult> BlockNumber([FromBody] BlockRequestDto dto)
        {
            if (string.IsNullOrEmpty(dto.PhoneNumber)) return BadRequest("Phone number is required.");
            var block = await _db.BlockedNumbers.FirstOrDefaultAsync(b => b.PhoneNumber == dto.PhoneNumber);
            if (block == null)
            {
                block = new BlockedNumber { PhoneNumber = dto.PhoneNumber, BlockedAt = DateTime.UtcNow };
                _db.BlockedNumbers.Add(block);
            }
            block.Reason = dto.Reason ?? string.Empty;
            block.BlockedUntil = dto.DurationDays.HasValue && dto.DurationDays > 0 ? DateTime.UtcNow.AddDays(dto.DurationDays.Value) : (DateTime?)null;
            block.BlockedBy = User.Identity?.Name ?? "Admin";
            await _db.SaveChangesAsync();
            return Ok(new { success = true });
        }

        [HttpPost("unblock")]
        public async Task<IActionResult> UnblockNumber([FromBody] UnblockRequestDto dto)
        {
            if (string.IsNullOrEmpty(dto.PhoneNumber)) return BadRequest();
            var block = await _db.BlockedNumbers.FirstOrDefaultAsync(b => b.PhoneNumber == dto.PhoneNumber);
            if (block != null)
            {
                _db.BlockedNumbers.Remove(block);
                await _db.SaveChangesAsync();
            }
            return Ok(new { success = true });
        }

        [HttpGet("blocked")]
        public async Task<IActionResult> GetBlockedNumbers()
        {
            var blocked = await _db.BlockedNumbers
                .OrderByDescending(b => b.BlockedAt)
                .ToListAsync();
            return Ok(blocked);
        }
    }

    public class FeedbackCreateDto
    {
        public string? Cat { get; set; }
        public string? Sender { get; set; }
        public string? Contact { get; set; }
        public string? Brgy { get; set; }
        public string? Vessel { get; set; }
        public string? Time { get; set; }
        public string? Status { get; set; }
        public string? Subject { get; set; }
        public string? Msg { get; set; }
    }

    public class StatusUpdateDto
    {
        public string? Status { get; set; }
    }

    public class BlockRequestDto
    {
        public string PhoneNumber { get; set; } = string.Empty;
        public int? DurationDays { get; set; }
        public string? Reason { get; set; }
    }

    public class UnblockRequestDto
    {
        public string PhoneNumber { get; set; } = string.Empty;
    }

    public static partial class AIHelper
    {
        public static string DeterminePriority(string? msg)
        {
            if (string.IsNullOrWhiteSpace(msg)) return "Low";
            var m = msg.ToLower();

            // CRITICAL: Immediate threat to life, sinking, fire, injuries
            var criticalWords = new[] { 
                "tabang", "reskyu", "help", "mayday", "sos", "emergency", 
                "nalunod", "lunod", "bangga", "sunog", "nasunog", 
                "nawala", "patay", "pusil", "gipusil", "nasamdan" 
            };
            
            if (criticalWords.Any(w => m.Contains(w))) 
                return "Critical";

            // HIGH: Illegal fishing, environmental damage, severe violations
            var highWords = new[] { 
                "dinamita", "iligal", "illegal", "dynamite", "compressor", 
                "cyanide", "hilo", "kuryente", "bawal", "guba", 
                "naguba", "nakasulod", "trespassing", "intrusion", "pukot" 
            };
            
            if (highWords.Any(w => m.Contains(w))) 
                return "High";

            return "Low";
        }

        public static string ExtractFlaggedPlace(string? msg)
        {
            if (string.IsNullOrWhiteSpace(msg)) return "Unknown";
            var m = msg.ToLower();
            if (m.Contains("patao")) return "Patao";
            if (m.Contains("sulangan")) return "Sulangan";
            if (m.Contains("guiwanon")) return "Guiwanon";
            return "Unknown";
        }
    }
}

