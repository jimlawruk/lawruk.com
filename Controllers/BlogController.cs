using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Lawruk.Models;

namespace Lawruk.Controllers
{
    public class BlogController : Controller
    {
        private readonly ILogger<HomeController> _logger;

        public BlogController(ILogger<HomeController> logger)
        {
            _logger = logger;
        }

        [Route("blog/tracking-traffic-during-covid")]
        public IActionResult TrackingTrafficDuringCovid()
        {
            return View();
        }
       
    }
}
