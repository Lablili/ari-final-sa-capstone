using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ari_final_sa_capstone.Data;
using ari_final_sa_capstone.Models;

namespace ari_final_sa_capstone.Controllers
{
    public class BlotterReportController : Controller
    {
        private readonly ApplicationDbContext _context;

        public BlotterReportController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: BlotterReport
        public async Task<IActionResult> Index()
        {
            return View(await _context.BlotterReports.ToListAsync());
        }

        // GET: BlotterReport/Create
        public IActionResult Create()
        {
            return View();
        }

        // POST: BlotterReport/Create
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Create([Bind("IncidentId,IncidentDate,IncidentType,Location,ReportSource,ActionsTaken,ResponseTimeMinutes,Outcome,Status,RelatedReportSubmissionId")] BlotterReport blotterReport)
        {
            if (ModelState.IsValid)
            {
                blotterReport.CreatedByAdmin = User.Identity?.Name ?? "Admin";
                _context.Add(blotterReport);
                await _context.SaveChangesAsync();
                return RedirectToAction(nameof(Index));
            }
            return View(blotterReport);
        }

        // GET: BlotterReport/Edit/5
        public async Task<IActionResult> Edit(int? id)
        {
            if (id == null)
            {
                return NotFound();
            }

            var blotterReport = await _context.BlotterReports.FindAsync(id);
            if (blotterReport == null)
            {
                return NotFound();
            }

            if (!string.IsNullOrEmpty(blotterReport.ActionsTaken) && blotterReport.ActionsTaken.StartsWith("<!-- BLOTTER_PAPER_HTML -->"))
            {
                var raw = blotterReport.ActionsTaken.Substring("<!-- BLOTTER_PAPER_HTML -->".Length);
                var plain = System.Text.RegularExpressions.Regex.Replace(raw, "<.*?>", " ");
                plain = System.Net.WebUtility.HtmlDecode(plain);
                plain = System.Text.RegularExpressions.Regex.Replace(plain, @"\s+", " ").Trim();
                blotterReport.ActionsTaken = plain;
            }

            return View(blotterReport);
        }

        // POST: BlotterReport/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("IncidentId,IncidentDate,IncidentType,Location,ReportSource,ActionsTaken,ResponseTimeMinutes,Outcome,Status,RelatedReportSubmissionId")] BlotterReport blotterReport, string? markAsDone = null)
        {
            if (id != blotterReport.IncidentId)
            {
                return NotFound();
            }

            if (!string.IsNullOrEmpty(markAsDone) && markAsDone.Equals("true", StringComparison.OrdinalIgnoreCase))
            {
                blotterReport.Status = "Done";
                if (string.IsNullOrWhiteSpace(blotterReport.Outcome) || blotterReport.Outcome == "Pending")
                {
                    blotterReport.Outcome = "Resolved";
                }
            }

            if (ModelState.IsValid)
            {
                try
                {
                    _context.Update(blotterReport);
                    await _context.SaveChangesAsync();
                }
                catch (DbUpdateConcurrencyException)
                {
                    if (!BlotterReportExists(blotterReport.IncidentId))
                    {
                        return NotFound();
                    }
                    else
                    {
                        throw;
                    }
                }
                return RedirectToAction(nameof(Index));
            }
            return View(blotterReport);
        }

        // POST: BlotterReport/UpdateStatus
        [HttpPost]
        public async Task<IActionResult> UpdateStatus([FromForm] int id, [FromForm] string status)
        {
            var blotter = await _context.BlotterReports.FindAsync(id);
            if (blotter == null)
            {
                return Json(new { success = false, message = "Blotter record not found." });
            }

            blotter.Status = string.IsNullOrWhiteSpace(status) ? "Done" : status;
            if (blotter.Status == "Done" || blotter.Status == "Closed")
            {
                if (string.IsNullOrWhiteSpace(blotter.Outcome) || blotter.Outcome == "Pending")
                {
                    blotter.Outcome = "Resolved";
                }
            }
            await _context.SaveChangesAsync();

            return Json(new { 
                success = true, 
                id = blotter.IncidentId, 
                status = blotter.Status, 
                outcome = blotter.Outcome, 
                message = $"Blotter #{blotter.IncidentId:D2} marked as {blotter.Status}!" 
            });
        }

        // GET: /BlotterReport/GetPaperContent?id=5&feedbackId=2
        [HttpGet]
        public async Task<IActionResult> GetPaperContent(int? id, int? feedbackId)
        {
            BlotterReport? blotter = null;

            if (id.HasValue && id.Value > 0)
            {
                blotter = await _context.BlotterReports.FindAsync(id.Value);
            }

            if (blotter == null && feedbackId.HasValue && feedbackId.Value > 0)
            {
                blotter = await _context.BlotterReports
                    .FirstOrDefaultAsync(b => b.RelatedReportSubmissionId == feedbackId.Value);
            }

            string? savedHtml = null;

            // 1. Check database ActionsTaken
            if (blotter != null && !string.IsNullOrEmpty(blotter.ActionsTaken) && blotter.ActionsTaken.StartsWith("<!-- BLOTTER_PAPER_HTML -->"))
            {
                savedHtml = blotter.ActionsTaken.Substring("<!-- BLOTTER_PAPER_HTML -->".Length);
            }

            // 2. Check file storage as backup
            if (string.IsNullOrEmpty(savedHtml))
            {
                var storageDir = Path.Combine(Directory.GetCurrentDirectory(), "Data", "BlotterPapers");
                if (blotter != null)
                {
                    var filePath = Path.Combine(storageDir, $"blotter_{blotter.IncidentId}.html");
                    if (System.IO.File.Exists(filePath))
                    {
                        savedHtml = await System.IO.File.ReadAllTextAsync(filePath);
                    }
                }
                if (string.IsNullOrEmpty(savedHtml) && feedbackId.HasValue && feedbackId.Value > 0)
                {
                    var filePath = Path.Combine(storageDir, $"feedback_{feedbackId.Value}.html");
                    if (System.IO.File.Exists(filePath))
                    {
                        savedHtml = await System.IO.File.ReadAllTextAsync(filePath);
                    }
                }
            }

            if (!string.IsNullOrEmpty(savedHtml))
            {
                return Json(new { 
                    success = true, 
                    html = savedHtml, 
                    incidentId = blotter?.IncidentId, 
                    status = blotter?.Status ?? "Open" 
                });
            }

            return Json(new { 
                success = false, 
                incidentId = blotter?.IncidentId, 
                status = blotter?.Status ?? "Open" 
            });
        }

        public class SaveBlotterPaperRequest
        {
            public int? IncidentId { get; set; }
            public int? RelatedReportSubmissionId { get; set; }
            public string? IncidentType { get; set; }
            public string? Location { get; set; }
            public string? ActionsTaken { get; set; }
            public string? Outcome { get; set; }
            public string? ReportSource { get; set; }
            public string? Status { get; set; }
            public string? PaperHtml { get; set; }
        }

        // POST: BlotterReport/SavePaper
        [HttpPost]
        public async Task<IActionResult> SavePaper([FromBody] SaveBlotterPaperRequest request)
        {
            if (request == null)
            {
                return BadRequest(new { success = false, message = "Invalid data." });
            }

            BlotterReport? blotter = null;
            string targetStatus = string.IsNullOrWhiteSpace(request.Status) ? "Done" : request.Status;

            if (request.IncidentId.HasValue && request.IncidentId.Value > 0)
            {
                blotter = await _context.BlotterReports.FindAsync(request.IncidentId.Value);
            }

            if (blotter == null && request.RelatedReportSubmissionId.HasValue && request.RelatedReportSubmissionId.Value > 0)
            {
                blotter = await _context.BlotterReports
                    .FirstOrDefaultAsync(b => b.RelatedReportSubmissionId == request.RelatedReportSubmissionId.Value);
            }

            if (blotter != null)
            {
                if (!string.IsNullOrWhiteSpace(request.IncidentType)) blotter.IncidentType = request.IncidentType;
                if (!string.IsNullOrWhiteSpace(request.Location)) blotter.Location = request.Location;
                if (!string.IsNullOrWhiteSpace(request.Outcome)) blotter.Outcome = request.Outcome;
                if (!string.IsNullOrWhiteSpace(request.ReportSource)) blotter.ReportSource = request.ReportSource;
                blotter.Status = targetStatus;

                if (!string.IsNullOrWhiteSpace(request.PaperHtml))
                {
                    blotter.ActionsTaken = $"<!-- BLOTTER_PAPER_HTML -->{request.PaperHtml}";
                }
                else if (!string.IsNullOrWhiteSpace(request.ActionsTaken))
                {
                    blotter.ActionsTaken = request.ActionsTaken;
                }
            }
            else
            {
                string actionsContent = !string.IsNullOrWhiteSpace(request.PaperHtml)
                    ? $"<!-- BLOTTER_PAPER_HTML -->{request.PaperHtml}"
                    : (!string.IsNullOrWhiteSpace(request.ActionsTaken) ? request.ActionsTaken : "Apprehended unauthorized vessel violating municipal fishing regulations.");

                blotter = new BlotterReport
                {
                    IncidentDate = DateTime.Now,
                    IncidentType = !string.IsNullOrWhiteSpace(request.IncidentType) ? request.IncidentType : "Maritime Incident",
                    Location = !string.IsNullOrWhiteSpace(request.Location) ? request.Location : "Bantayan Municipal Waters",
                    ReportSource = !string.IsNullOrWhiteSpace(request.ReportSource) ? request.ReportSource : "Bantay Dagat Sea Patrol Team",
                    ActionsTaken = actionsContent,
                    Outcome = !string.IsNullOrWhiteSpace(request.Outcome) ? request.Outcome : "Resolved / Done",
                    Status = targetStatus,
                    RelatedReportSubmissionId = request.RelatedReportSubmissionId,
                    CreatedByAdmin = User.Identity?.Name ?? "Admin"
                };
                _context.BlotterReports.Add(blotter);
            }

            if (request.RelatedReportSubmissionId.HasValue)
            {
                var feedback = await _context.FeedbackMessages.FindAsync(request.RelatedReportSubmissionId.Value);
                if (feedback != null && (feedback.Status == "new" || feedback.Status == "review" || feedback.Status == "pending"))
                {
                    feedback.Status = "resolved";
                    feedback.ActionedByAdmin = User.Identity?.Name ?? "Admin";
                }
            }

            await _context.SaveChangesAsync();

            // Persist full paper HTML to disk storage for cross-view synchronization
            if (!string.IsNullOrWhiteSpace(request.PaperHtml))
            {
                try
                {
                    var storageDir = Path.Combine(Directory.GetCurrentDirectory(), "Data", "BlotterPapers");
                    if (!Directory.Exists(storageDir)) Directory.CreateDirectory(storageDir);

                    var incidentFilePath = Path.Combine(storageDir, $"blotter_{blotter.IncidentId}.html");
                    await System.IO.File.WriteAllTextAsync(incidentFilePath, request.PaperHtml);

                    if (blotter.RelatedReportSubmissionId.HasValue)
                    {
                        var feedbackFilePath = Path.Combine(storageDir, $"feedback_{blotter.RelatedReportSubmissionId.Value}.html");
                        await System.IO.File.WriteAllTextAsync(feedbackFilePath, request.PaperHtml);
                    }
                }
                catch (Exception)
                {
                    // Fail silently, DB has it stored
                }
            }

            return Json(new
            {
                success = true,
                incidentId = blotter.IncidentId,
                status = blotter.Status,
                message = $"Blotter #{blotter.IncidentId:D2} successfully saved and synchronized!"
            });
        }

        private bool BlotterReportExists(int id)
        {
            return _context.BlotterReports.Any(e => e.IncidentId == id);
        }
    }
}
