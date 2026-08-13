using System.Diagnostics;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ari_final_sa_capstone.Data;
using ari_final_sa_capstone.Models;

namespace ari_final_sa_capstone.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    private readonly ApplicationDbContext _db;

    public HomeController(ILogger<HomeController> logger, ApplicationDbContext db)
    {
        _logger = logger;
        _db = db;
    }

    public async Task<IActionResult> Index()
    {
        ViewData["Title"] = "Overview";

        var blotters = await _db.BlotterReports.ToListAsync();
        var totalIncidents = blotters.Count;
        var avgResponseTime = totalIncidents > 0 ? blotters.Average(b => b.ResponseTimeMinutes) : 0;
        var closedCases = blotters.Count(b => b.Status == "Closed");
        
        var smsLogs = await _db.SMSLogs.ToListAsync();
        var totalSmsSent = smsLogs.Count;
        var deliveredSms = smsLogs.Count(s => s.Status == "Delivered");
        var deliveryRate = totalSmsSent > 0 ? (double)deliveredSms / totalSmsSent * 100 : 0;

        var totalFisherfolk = await _db.FisherfolkRegistries.CountAsync(f => f.RegistrationStatus != "Inactive");
        
        var submissions = await _db.ReportSubmissions.ToListAsync();
        var activeUsers = submissions.Select(s => s.FisherfolkId).Distinct().Count();
        var adoptionRate = totalFisherfolk > 0 ? (double)activeUsers / totalFisherfolk * 100 : 0;

        // --- TREND CALCULATION LOGIC ---
        var now = DateTime.Now;
        var currentMonthStart = new DateTime(now.Year, now.Month, 1);
        var lastMonthStart = currentMonthStart.AddMonths(-1);
        
        // Blotters
        var cmBlotters = blotters.Where(b => b.IncidentDate >= currentMonthStart).ToList();
        var lmBlotters = blotters.Where(b => b.IncidentDate >= lastMonthStart && b.IncidentDate < currentMonthStart).ToList();
        
        double GetPctChange(double current, double previous) => previous == 0 ? (current > 0 ? 100 : 0) : ((current - previous) / previous) * 100;
        
        var cmIncidents = cmBlotters.Count;
        var lmIncidents = lmBlotters.Count;
        ViewBag.IncidentsTrend = Math.Round(GetPctChange(cmIncidents, lmIncidents), 1);
        
        var cmRespTime = cmIncidents > 0 ? cmBlotters.Average(b => b.ResponseTimeMinutes) : 0;
        var lmRespTime = lmIncidents > 0 ? lmBlotters.Average(b => b.ResponseTimeMinutes) : 0;
        ViewBag.ResponseTimeTrend = Math.Round(GetPctChange(cmRespTime, lmRespTime), 1);
        
        var cmEnforcement = cmIncidents > 0 ? ((double)cmBlotters.Count(b => b.Status == "Closed") / cmIncidents) * 100 : 0;
        var lmEnforcement = lmIncidents > 0 ? ((double)lmBlotters.Count(b => b.Status == "Closed") / lmIncidents) * 100 : 0;
        ViewBag.EnforcementTrend = Math.Round(GetPctChange(cmEnforcement, lmEnforcement), 1);
        
        // SMS
        var cmSms = smsLogs.Where(s => s.TimestampSent >= currentMonthStart).ToList();
        var lmSms = smsLogs.Where(s => s.TimestampSent >= lastMonthStart && s.TimestampSent < currentMonthStart).ToList();
        
        var cmDeliveryRate = cmSms.Count > 0 ? ((double)cmSms.Count(s => s.Status == "Delivered") / cmSms.Count) * 100 : 0;
        var lmDeliveryRate = lmSms.Count > 0 ? ((double)lmSms.Count(s => s.Status == "Delivered") / lmSms.Count) * 100 : 0;
        ViewBag.DeliveryTrend = Math.Round(GetPctChange(cmDeliveryRate, lmDeliveryRate), 1);
        // -------------------------------

        ViewBag.TotalIncidents = totalIncidents;
        ViewBag.AvgResponseTime = Math.Round(avgResponseTime, 2);
        ViewBag.EnforcementRate = totalIncidents > 0 ? Math.Round((double)closedCases / totalIncidents * 100, 2) : 0;
        
        ViewBag.DeliveryRate = Math.Round(deliveryRate, 2);
        ViewBag.AdoptionRate = Math.Round(adoptionRate, 2);
        ViewBag.TotalFisherfolk = totalFisherfolk;

        var last12Months = Enumerable.Range(0, 12).Select(i => DateTime.Now.AddMonths(-11 + i)).ToList();
        var incidentsOverTime = last12Months.Select(m => new {
            Month = m.ToString("MMM yyyy"),
            Count = blotters.Count(b => b.IncidentDate.Year == m.Year && b.IncidentDate.Month == m.Month)
        }).ToList();
        
        ViewBag.TimeLabels = System.Text.Json.JsonSerializer.Serialize(incidentsOverTime.Select(x => x.Month));
        ViewBag.TimeData = System.Text.Json.JsonSerializer.Serialize(incidentsOverTime.Select(x => x.Count));

        var barangays = new[] { "Patao", "Guiwanon", "Sulangan", "Other" };
        var byBarangay = blotters.GroupBy(b => 
            barangays.Contains(b.Location) ? b.Location : "Other"
        ).Select(g => new { Barangay = g.Key, Count = g.Count() }).ToList();
        
        var bgyLabels = barangays.ToList();
        var bgyData = bgyLabels.Select(b => byBarangay.FirstOrDefault(x => x.Barangay == b)?.Count ?? 0).ToList();
        
        ViewBag.BarangayLabels = System.Text.Json.JsonSerializer.Serialize(bgyLabels);
        ViewBag.BarangayData = System.Text.Json.JsonSerializer.Serialize(bgyData);

        var incidentTypes = blotters.GroupBy(b => b.IncidentType)
                                    .Select(g => new { Type = g.Key, Count = g.Count() })
                                    .ToList();
        ViewBag.IncidentTypesLabels = System.Text.Json.JsonSerializer.Serialize(incidentTypes.Select(x => x.Type));
        ViewBag.IncidentTypesData = System.Text.Json.JsonSerializer.Serialize(incidentTypes.Select(x => x.Count));

        var incidentStatus = blotters.GroupBy(b => b.Status)
                                     .Select(g => new { Status = g.Key, Count = g.Count() })
                                     .ToList();
        ViewBag.IncidentStatusLabels = System.Text.Json.JsonSerializer.Serialize(incidentStatus.Select(x => x.Status));
        ViewBag.IncidentStatusData = System.Text.Json.JsonSerializer.Serialize(incidentStatus.Select(x => x.Count));

        return View();
    }

    public IActionResult Feedback()
    {
        var sessionRole = HttpContext.Session.GetString("UserRole") ?? User.Claims.FirstOrDefault(c => c.Type == System.Security.Claims.ClaimTypes.Role)?.Value;
        if (sessionRole == "FisheriesAdmin")
        {
            return RedirectToAction("Index");
        }

        ViewData["Title"] = "Community Reports";
        return View();
    }

    public async Task<IActionResult> Announcement()
    {
        ViewData["Title"] = "Announcements";

        // Live counts from the database
        var activeFisherfolk = _db.FisherfolkRegistries.Where(f => f.RegistrationStatus != "Inactive");
        var all       = await activeFisherfolk.CountAsync();
        var sulangan  = await activeFisherfolk.CountAsync(f => f.Barangay == "Sulangan");
        var patao     = await activeFisherfolk.CountAsync(f => f.Barangay == "Patao");
        var guiwanon  = await activeFisherfolk.CountAsync(f => f.Barangay == "Guiwanon");

        ViewBag.CountAll      = all.ToString("N0");
        ViewBag.CountSulangan = sulangan.ToString("N0");
        ViewBag.CountPatao    = patao.ToString("N0");
        ViewBag.CountGuiwanon = guiwanon.ToString("N0");

        return View();
    }

    [HttpGet]
    public async Task<IActionResult> ExportFeedbackCsv()
    {
        var records = await _db.FeedbackMessages
            .OrderBy(f => f.DateReceived)
            .ThenBy(f => f.TimeReceived)
            .ToListAsync();

        var sb = new StringBuilder();

        // UTF-8 BOM so Excel opens it correctly
        sb.AppendLine(
            "\uFEFF" +
            "Report #," +
            "Category / Type of Incident," +
            "Status," +
            "Contact Number," +
            "Priority Level," +
            "Flagged Place," +
            "Subject," +
            "Date Received," +
            "Time Received," +
            "Full Message / Narrative"
        );

        foreach (var f in records)
        {
            var dateStr = f.DateReceived.ToString("yyyy-MM-dd");
            var timeStr = f.TimeReceived.ToString(@"hh\:mm\:ss");

            sb.AppendLine(
                $"{f.Id}," +
                $"{CsvCell(f.Category)}," +
                $"{CsvCell(f.Status)}," +
                $"{CsvCell(f.ContactNumber)}," +
                $"{CsvCell(f.PriorityLevel)}," +
                $"{CsvCell(f.FlaggedPlace)}," +
                $"{CsvCell(f.Subject)}," +
                $"{CsvCell(dateStr)}," +
                $"{CsvCell(timeStr)}," +
                $"{CsvCell(f.Message)}"
            );
        }

        var fileName = $"BantayDagat_Feedback_{DateTime.Now:yyyy-MM-dd}.csv";
        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        return File(bytes, "text/csv; charset=utf-8", fileName);
    }

    // Wraps a value in double-quotes, escaping any embedded double-quotes.
    private static string CsvCell(string? value)
    {
        var safe = (value ?? "").Replace("\"", "\"\"");
        return $"\"{safe}\"";
    }

    [HttpGet]
    public async Task<IActionResult> ExportFisherfolkCsv()
    {
        var records = await _db.FisherfolkRegistries
            .OrderBy(f => f.Lname)
            .ThenBy(f => f.Fname)
            .ToListAsync();

        var sb = new StringBuilder();

        // UTF-8 BOM so Excel opens it correctly
        sb.AppendLine(
            "\uFEFF" +
            "Fisherfolk ID," +
            "Complete Name," +
            "Address," +
            "Barangay," +
            "Birthdate," +
            "Age," +
            "Gender," +
            "Vessel Type," +
            "Vessel Name," +
            "Boat Number," +
            "Permit Number," +
            "Capture Method," +
            "Contact Number," +
            "Registration Status"
        );

        foreach (var f in records)
        {
            var fullName = $"{f.Fname} {(string.IsNullOrEmpty(f.Mname) ? "" : f.Mname + " ")}{f.Lname}";
            var dateStr = f.Birthdate.ToString("yyyy-MM-dd");

            sb.AppendLine(
                $"{f.Id}," +
                $"{CsvCell(fullName)}," +
                $"{CsvCell(f.Address)}," +
                $"{CsvCell(f.Barangay)}," +
                $"{CsvCell(dateStr)}," +
                $"{f.Age}," +
                $"{CsvCell(f.Gender)}," +
                $"{CsvCell(f.VesselType)}," +
                $"{CsvCell(f.VesselName)}," +
                $"{CsvCell(f.BoatNumber)}," +
                $"{CsvCell(f.PermitNumber)}," +
                $"{CsvCell(f.CaptureMethod)}," +
                $"{CsvCell(f.ContactNumber)}," +
                $"{CsvCell(f.RegistrationStatus)}"
            );
        }

        var fileName = $"BantayDagat_Fisherfolk_{DateTime.Now:yyyy-MM-dd}.csv";
        var bytes = Encoding.UTF8.GetBytes(sb.ToString());
        return File(bytes, "text/csv; charset=utf-8", fileName);
    }

    public async Task<IActionResult> FisherfolkInfo()
    {


        ViewData["Title"] = "Fisherfolk Info";

        var all = _db.FisherfolkRegistries;

        if (await all.CountAsync() == 0)
        {
            _db.FisherfolkRegistries.AddRange(new List<FisherfolkRegistry>
            {
                new FisherfolkRegistry {
                    Fname = "Juan", Lname = "Dela Cruz Jr.", Address = "Purok 2, Sitio Proper",
                    Barangay = "Patao", Birthdate = new DateTime(1987, 6, 14), Age = 38,
                    Gender = "Male", VesselType = "Small Scale", VesselName = "M/B Pag-asa",
                    BoatNumber = "BTY-PAT-014", PermitNumber = "BD-BAN-2026-0014",
                    CaptureMethod = "Pamasol / Panagat", ContactNumber = "+63 917 555 1024",
                    RegistrationStatus = "Active", RegCode = "BTY-PAT-014", IsActive = true
                },
                new FisherfolkRegistry {
                    Fname = "Elpidio", Lname = "Reyes", Address = "Purok 1, Silang",
                    Barangay = "Patao", Birthdate = new DateTime(1980, 11, 8), Age = 45,
                    Gender = "Male", VesselType = "Medium Scale", VesselName = "M/B Sea Hawk",
                    BoatNumber = "BTY-PAT-035", PermitNumber = "BD-BAN-2026-0215",
                    CaptureMethod = "Motorized Net Fishing", ContactNumber = "+63 918 333 4455",
                    RegistrationStatus = "For Renewal", RegCode = "BTY-PAT-035", IsActive = true
                },
                new FisherfolkRegistry {
                    Fname = "Rosa", Lname = "Aquino", Address = "Purok 3, Ligaya",
                    Barangay = "Guiwanon", Birthdate = new DateTime(1995, 7, 19), Age = 30,
                    Gender = "Female", VesselType = "Small Scale", VesselName = "M/B Aurora",
                    BoatNumber = "BTY-GUI-042", PermitNumber = "BD-BAN-2026-1187",
                    CaptureMethod = "Bubo", ContactNumber = "+63 918 234 5678",
                    RegistrationStatus = "Pending Verification", RegCode = "BTY-GUI-042", IsActive = true
                }
            });
            await _db.SaveChangesAsync();
        }

        var activeFisherfolk = all.Where(f => f.RegistrationStatus != "Inactive");
        ViewBag.Total         = await activeFisherfolk.CountAsync();
        ViewBag.CountPatao    = await activeFisherfolk.CountAsync(f => f.Barangay == "Patao");
        ViewBag.CountGuiwanon = await activeFisherfolk.CountAsync(f => f.Barangay == "Guiwanon");
        ViewBag.CountSulangan = await activeFisherfolk.CountAsync(f => f.Barangay == "Sulangan");

        return View();
    }

    public IActionResult SMSOperations()
    {
        ViewData["Title"] = "SMS Operations";
        return View();
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [Microsoft.AspNetCore.Authorization.AllowAnonymous]
    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}

