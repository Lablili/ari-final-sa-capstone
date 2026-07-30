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
        var deliveredSms = smsLogs.Count(s => s.DeliveryStatus == "Delivered");
        var deliveryRate = totalSmsSent > 0 ? (double)deliveredSms / totalSmsSent * 100 : 0;

        var fisherfolk = await _db.FisherfolkRegistries.ToListAsync();
        var totalFisherfolk = fisherfolk.Count;
        
        var submissions = await _db.ReportSubmissions.ToListAsync();
        var activeUsers = submissions.Select(s => s.FisherfolkId).Distinct().Count();
        var adoptionRate = totalFisherfolk > 0 ? (double)activeUsers / totalFisherfolk * 100 : 0;

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
        ViewData["Title"] = "Community Reports";
        return View();
    }

    public async Task<IActionResult> Announcement()
    {
        ViewData["Title"] = "Announcements";

        // Live counts from the database
        var all       = await _db.FisherfolkRegistries.CountAsync();
        var sulangan  = await _db.FisherfolkRegistries.CountAsync(f => f.Frbarangay == "Sulangan");
        var patao     = await _db.FisherfolkRegistries.CountAsync(f => f.Frbarangay == "Patao");
        var guiwanon  = await _db.FisherfolkRegistries.CountAsync(f => f.Frbarangay == "Guiwanon");

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
            .OrderBy(f => f.MdateReceived)
            .ThenBy(f => f.MtimeReceived)
            .ToListAsync();

        var sb = new StringBuilder();

        // UTF-8 BOM so Excel opens it correctly
        sb.AppendLine(
            "\uFEFF" +
            "Report #," +
            "Category / Type of Incident," +
            "Status," +
            "Sender Name," +
            "Contact Number," +
            "Barangay," +
            "Vessel / Boat," +
            "Subject," +
            "Date Received," +
            "Time Received," +
            "Full Message / Narrative"
        );

        foreach (var f in records)
        {
            var dateStr = f.MdateReceived.ToString("yyyy-MM-dd");
            var timeStr = f.MtimeReceived.ToString(@"hh\:mm\:ss");

            sb.AppendLine(
                $"{f.MId}," +
                $"{CsvCell(f.MCategory)}," +
                $"{CsvCell(f.Mstatus)}," +
                $"{CsvCell(f.MSender)}," +
                $"{CsvCell(f.McontactNumber)}," +
                $"{CsvCell(f.Mbarangay)}," +
                $"{CsvCell(f.Mvessel ?? "N/A")}," +
                $"{CsvCell(f.Msubject)}," +
                $"{CsvCell(dateStr)}," +
                $"{CsvCell(timeStr)}," +
                $"{CsvCell(f.Mmessage)}"
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
            .OrderBy(f => f.Frlname)
            .ThenBy(f => f.Frfname)
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
            var fullName = $"{f.Frfname} {(string.IsNullOrEmpty(f.Frmname) ? "" : f.Frmname + " ")}{f.Frlname}";
            var dateStr = f.Frbirthdate.ToString("yyyy-MM-dd");

            sb.AppendLine(
                $"{f.FrId}," +
                $"{CsvCell(fullName)}," +
                $"{CsvCell(f.Fraddress)}," +
                $"{CsvCell(f.Frbarangay)}," +
                $"{CsvCell(dateStr)}," +
                $"{f.Frage}," +
                $"{CsvCell(f.Frgender)}," +
                $"{CsvCell(f.FrvesselType)}," +
                $"{CsvCell(f.FrvesselName)}," +
                $"{CsvCell(f.FrboatNumber)}," +
                $"{CsvCell(f.FrpermitNumber)}," +
                $"{CsvCell(f.FrcaptureMethod)}," +
                $"{CsvCell(f.FrcontactNumber)}," +
                $"{CsvCell(f.FrregistrationStatus)}"
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
                    Frfname = "Juan", Frlname = "Dela Cruz Jr.", Fraddress = "Purok 2, Sitio Proper",
                    Frbarangay = "Patao", Frbirthdate = new DateTime(1987, 6, 14), Frage = 38,
                    Frgender = "Male", FrvesselType = "Small Scale", FrvesselName = "M/B Pag-asa",
                    FrboatNumber = "BTY-PAT-014", FrpermitNumber = "BD-BAN-2026-0014",
                    FrcaptureMethod = "Pamasol / Panagat", FrcontactNumber = "+63 917 555 1024",
                    FrregistrationStatus = "Active", FrregCode = "BTY-PAT-014", FrisActive = true
                },
                new FisherfolkRegistry {
                    Frfname = "Elpidio", Frlname = "Reyes", Fraddress = "Purok 1, Silang",
                    Frbarangay = "Patao", Frbirthdate = new DateTime(1980, 11, 8), Frage = 45,
                    Frgender = "Male", FrvesselType = "Medium Scale", FrvesselName = "M/B Sea Hawk",
                    FrboatNumber = "BTY-PAT-035", FrpermitNumber = "BD-BAN-2026-0215",
                    FrcaptureMethod = "Motorized Net Fishing", FrcontactNumber = "+63 918 333 4455",
                    FrregistrationStatus = "For Renewal", FrregCode = "BTY-PAT-035", FrisActive = true
                },
                new FisherfolkRegistry {
                    Frfname = "Rosa", Frlname = "Aquino", Fraddress = "Purok 3, Ligaya",
                    Frbarangay = "Guiwanon", Frbirthdate = new DateTime(1995, 7, 19), Frage = 30,
                    Frgender = "Female", FrvesselType = "Small Scale", FrvesselName = "M/B Aurora",
                    FrboatNumber = "BTY-GUI-042", FrpermitNumber = "BD-BAN-2026-1187",
                    FrcaptureMethod = "Bubo", FrcontactNumber = "+63 918 234 5678",
                    FrregistrationStatus = "Pending Verification", FrregCode = "BTY-GUI-042", FrisActive = true
                }
            });
            await _db.SaveChangesAsync();
        }

        ViewBag.Total         = await all.CountAsync();
        ViewBag.CountPatao    = await all.CountAsync(f => f.Frbarangay == "Patao");
        ViewBag.CountGuiwanon = await all.CountAsync(f => f.Frbarangay == "Guiwanon");
        ViewBag.CountSulangan = await all.CountAsync(f => f.Frbarangay == "Sulangan");

        return View();
    }

    public IActionResult Privacy()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
