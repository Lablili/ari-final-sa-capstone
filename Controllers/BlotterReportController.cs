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
            return View(blotterReport);
        }

        // POST: BlotterReport/Edit/5
        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> Edit(int id, [Bind("IncidentId,IncidentDate,IncidentType,Location,ReportSource,ActionsTaken,ResponseTimeMinutes,Outcome,Status,RelatedReportSubmissionId")] BlotterReport blotterReport)
        {
            if (id != blotterReport.IncidentId)
            {
                return NotFound();
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

        private bool BlotterReportExists(int id)
        {
            return _context.BlotterReports.Any(e => e.IncidentId == id);
        }
    }
}
