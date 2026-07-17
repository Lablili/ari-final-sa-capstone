using Microsoft.AspNetCore.Mvc;
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

        // GET /api/feedback  — return all records as JSON
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var records = await _db.FeedbackMessages
                .OrderByDescending(f => f.MdateReceived)
                .ThenByDescending(f => f.MtimeReceived)
                .ToListAsync();

            var result = records.Select(f => new
            {
                id = f.MId,
                cat = f.MCategory,
                sender = f.MSender,
                contact = f.McontactNumber,
                brgy = f.Mbarangay,
                vessel = f.Mvessel ?? "N/A",
                time = f.MdateReceived.ToString("yyyy-MM-dd") + " " +
                             f.MtimeReceived.ToString(@"hh\:mm"),
                status = f.Mstatus,
                subject = f.Msubject,
                msg = f.Mmessage
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

                var record = new FeedbackMessage
                {
                    MCategory = dto.Cat ?? "info",
                    MSender = dto.Sender ?? "",
                    McontactNumber = dto.Contact ?? "",
                    Mbarangay = dto.Brgy ?? "",
                    Mvessel = dto.Vessel,
                    MdateReceived = dateReceived,
                    MtimeReceived = timeReceived,
                    Mstatus = dto.Status ?? "new",
                    Msubject = dto.Subject ?? "",
                    Mmessage = dto.Msg ?? ""
                };

                _db.FeedbackMessages.Add(record);
            }

            await _db.SaveChangesAsync();
            return Ok(new { saved = items.Count });
        }

        // PATCH /api/feedback/{id}/status  — update status only
        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(int id, [FromBody] StatusUpdateDto dto)
        {
            var record = await _db.FeedbackMessages.FindAsync(id);
            if (record == null) return NotFound();

            record.Mstatus = dto.Status ?? record.Mstatus;
            await _db.SaveChangesAsync();
            return Ok(new { id, status = record.Mstatus });
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
}
