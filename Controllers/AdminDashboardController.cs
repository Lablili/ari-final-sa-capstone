using Microsoft.AspNetCore.Mvc;

namespace ari_final_sa_capstone.Controllers
{
    public class AdminDashboardController : Controller
    {
        // Keep Index as the single admin entrypoint (Overview)
        public IActionResult Index()
        {
            var role = HttpContext.Session.GetString("UserRole");
            if (string.IsNullOrEmpty(role) || (role != "SuperAdmin" && role != "BantayDagatAdmin" && role != "FisherfolkAdmin"))
            {
                return RedirectToAction("Login", "Account");
            }

            ViewBag.Role = role;
            ViewBag.UserName = HttpContext.Session.GetString("UserName");

            if (role == "SuperAdmin")
            {
                return RedirectToAction("Index", "UserManagement");
            }

            // Explicitly render the Home/Index overview to keep only one Index (admin overview)
            return RedirectToAction("Index", "Home");
        }
    }
}
