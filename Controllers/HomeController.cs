using System.Diagnostics;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Lawruk.Models;
using Lawruk.Services;

namespace Lawruk.Controllers
{
    public class HomeController : Controller
    {
        private readonly ILogger<HomeController> logger;
        private RaceResultService raceResultService;

        public HomeController(ILogger<HomeController> diLogger, [FromServices] IWebHostEnvironment env, RaceResultService diRaceResultService)
        {
            logger = diLogger;
            raceResultService = diRaceResultService;
            raceResultService.RacesFolderFilePath = env.ContentRootPath + "\\races";
        }

        public IActionResult Index()
        {
            var pageViewModel = new PageViewModel();
            pageViewModel.PageTitle = "Lawruk.com";
            pageViewModel.ShowPageTitle = false;
            return View(pageViewModel);
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
        }

        [Route("haunted-places")]
        public IActionResult HauntedPlaces()
        {
            var pageViewModel = new PageViewModel();
            return View(pageViewModel);
        }

        [Route("race-results")]
        public IActionResult RaceResults()
        {
            return View(raceResultService.GetRaceResultsViewModel());
        }

        [Route("race-results/{url}")]
        public IActionResult Race(string url)
        {
            var raceViewModel = raceResultService.GetRaceViewModelWithTextByUrl(url);
            ViewData["Title"] = raceViewModel.Title;
            if (raceViewModel != null)
                return View(raceViewModel);
            else
                return null;
        }
    }
}
