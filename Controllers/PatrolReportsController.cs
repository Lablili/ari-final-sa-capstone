using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ari_final_sa_capstone.Controllers
{
    [Authorize(Roles = "BantayDagatAdmin,SuperAdmin")]
    public class PatrolReportsController : Controller
    {
        public IActionResult List()
        {
            return View("List");
        }
    }
}
