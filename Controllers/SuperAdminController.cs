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
                
            return View(logs);
        }

        [HttpPost]
        public async Task<IActionResult> GenerateMockSms()
        {
            var random = new Random();
            var types = new[] { "Announcement", "SOS Alert", "Weather Warning", "Registration" };
            var statuses = new[] { "Delivered", "Delivered", "Delivered", "Failed", "PENDING" };
            
            var status = statuses[random.Next(statuses.Length)];
            
            var mockLog = new SMSLog
            {
                MessageType = types[random.Next(types.Length)],
                PhoneNumber = $"+639{random.Next(100000000, 999999999)}",
                Status = status,
                TimestampSent = DateTime.Now.AddMinutes(-random.Next(0, 30)),
                RetryCount = status == "Failed" ? random.Next(1, 4) : 0
            };

            if (status == "Delivered") {
                mockLog.TimestampReceived = mockLog.TimestampSent.AddSeconds(random.Next(2, 45));
            }

            _context.SMSLogs.Add(mockLog);
            await _context.SaveChangesAsync();

            return RedirectToAction("Monitoring");
        }

        public IActionResult DataExport()
        {
            return View();
        }

        [HttpGet]
        public async Task<IActionResult> ExportBlottersCsv()
        {
            var records = await _context.BlotterReports
                .OrderByDescending(b => b.IncidentDate)
                .ToListAsync();

            var sb = new StringBuilder();
            sb.AppendLine("\uFEFFIncident ID,Date,Type,Location,Source,Response Time (Mins),Status,Outcome");

            foreach (var b in records)
            {
                var dateStr = b.IncidentDate.ToString("yyyy-MM-dd HH:mm");
                sb.AppendLine($"{b.IncidentId},{CsvCell(dateStr)},{CsvCell(b.IncidentType)},{CsvCell(b.Location)},{CsvCell(b.ReportSource)},{b.ResponseTimeMinutes},{CsvCell(b.Status)},{CsvCell(b.Outcome)}");
            }

            var fileName = $"BantayDagat_Blotters_{DateTime.Now:yyyy-MM-dd}.csv";
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
