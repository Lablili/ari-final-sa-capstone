using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ari_final_sa_capstone.Data;
using ari_final_sa_capstone.Models;

namespace ari_final_sa_capstone.Controllers
{
    public class SuperAdminController : Controller
    {
        private readonly ApplicationDbContext _context;

        public SuperAdminController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> SystemDashboard()
        {
            ViewBag.TotalFisherfolk = await _context.FisherfolkRegistries.CountAsync(f => f.RegistrationStatus != "Inactive");
            ViewBag.TotalBlotters = await _context.BlotterReports.CountAsync();
            ViewBag.TotalSmsLogs = await _context.SMSLogs.CountAsync();
            ViewBag.TotalCommunityReports = await _context.ReportSubmissions.CountAsync();
            
            return View();
        }

        public IActionResult Settings()
        {
            // For MVP, just returning the view with mock settings
            return View();
        }

        public async Task<IActionResult> Monitoring()
        {
            var logs = await _context.SMSLogs
                .OrderByDescending(l => l.TimestampSent)
                .Take(50) // Limit for performance
                .ToListAsync();
                
            ViewBag.HardwareConnected = ari_final_sa_capstone.Services.HardwareMonitor.IsConnected;
            ViewBag.HardwareStatusMessage = ari_final_sa_capstone.Services.HardwareMonitor.StatusMessage;
            ViewBag.HardwareSignalStrength = ari_final_sa_capstone.Services.HardwareMonitor.SignalStrength;

            return View(logs);
        }



        public IActionResult DataExport()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> ExportBlottersCsv()
        {
            // Only export reports that were marked as Done or Closed
            var records = await _context.BlotterReports
                .Where(b => b.Status == "Done" || b.Status == "Closed")
                .OrderByDescending(b => b.IncidentDate)
                .ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine("\uFEFFFile No.,Date,Subject,Nature of Case,Time of Occurrence,Place of Occurrence,Report Source / Apprehended By,Facts & Actions Taken,Outcome & Disposition,Status");

            foreach (var b in records)
            {
                var fileNo = b.IncidentId.ToString("D2");
                var dateStr = b.IncidentDate.ToString("MMMM d, yyyy");
                var timeStr = b.IncidentDate.ToString("hh:mm tt");
                var subject = "Excerpt from the Municipal Bantay Dagat Blotter Report";
                var natureOfCase = $"Resolution #33 Ordinance #02 Series of 2020 Section 37 Article 8 ({b.IncidentType})";
                var place = b.Location;
                var source = b.ReportSource;
                var actions = b.ActionsTaken;
                var outcome = string.IsNullOrWhiteSpace(b.Outcome) ? "Resolved / Done" : b.Outcome;
                var status = b.Status;

                sb.AppendLine($"{CsvCell(fileNo)},{CsvCell(dateStr)},{CsvCell(subject)},{CsvCell(natureOfCase)},{CsvCell(timeStr)},{CsvCell(place)},{CsvCell(source)},{CsvCell(actions)},{CsvCell(outcome)},{CsvCell(status)}");
            }

            var fileName = $"BantayDagat_Blotter_Reports_Done_{DateTime.Now:yyyy-MM-dd}.csv";
            return File(Encoding.UTF8.GetBytes(sb.ToString()), "text/csv; charset=utf-8", fileName);
        }

        [HttpGet]
        public async Task<IActionResult> ExportSmsLogsCsv()
        {
            var records = await _context.SMSLogs
                .OrderByDescending(l => l.TimestampSent)
                .ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine("\uFEFFSMS ID,Type,Phone Number,Status,Date Sent,Date Received");

            foreach (var l in records)
            {
                var dateSent = l.TimestampSent.ToString("yyyy-MM-dd HH:mm:ss");
                var dateRec = l.TimestampReceived?.ToString("yyyy-MM-dd HH:mm:ss") ?? "N/A";
                sb.AppendLine($"{l.SmsId},{CsvCell(l.MessageType)},{CsvCell(l.PhoneNumber)},{CsvCell(l.Status)},{CsvCell(dateSent)},{CsvCell(dateRec)}");
            }

            var fileName = $"BantayDagat_SMSLogs_{DateTime.Now:yyyy-MM-dd}.csv";
            return File(Encoding.UTF8.GetBytes(sb.ToString()), "text/csv; charset=utf-8", fileName);
        }

        private static string CsvCell(string? value)
        {
            var safe = (value ?? "").Replace("\"", "\"\"");
            return $"\"{safe}\"";
        }
    }
}
