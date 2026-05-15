using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using ari_final_sa_capstone.Models;

namespace ari_final_sa_capstone.Controllers;

public class HomeController : Controller
{
    public IActionResult Index()
    {
        return View();
    }

    public IActionResult IncidentReport()
    {
        return View();
    }

    public IActionResult FisherfolkInfo()
    {
        return View();
    }

    public IActionResult Announcement()
    {
        return View();
    }

    [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
    public IActionResult Error()
    {
        return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
    }
}
