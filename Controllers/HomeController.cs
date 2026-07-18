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

    public IActionResult Index()
    {
        ViewData["Title"] = "Overview";
        return View();
    }

    public IActionResult Feedback()
    {
        ViewData["Title"] = "Feedback";
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

    public IActionResult FisherfolkInfo()
    {
        ViewData["Title"] = "Fisherfolk Info";
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
