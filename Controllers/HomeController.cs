using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ari_final_sa_capstone.Models;

namespace ari_final_sa_capstone.Controllers;

public class HomeController : Controller
{
    private readonly ILogger<HomeController> _logger;

    public HomeController(ILogger<HomeController> logger)
    {
        _logger = logger;
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

    public IActionResult Announcement()
    {
        ViewData["Title"] = "Announcements";
        return View();
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
