using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace ari_final_sa_capstone.Controllers
{
    [Authorize(Roles = "FisheriesAdmin,SuperAdmin")]
    public class FisherfolkRecordsController : Controller
    {
        public IActionResult List()
        {
            return View("List");
        }
    }
}
