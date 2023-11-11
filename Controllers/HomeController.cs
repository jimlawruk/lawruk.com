using System.Diagnostics;
using Microsoft.AspNetCore.Mvc;
using Lawruk.Models;
using Lawruk.Services;

namespace Lawruk.Controllers
{
    [ApiController]
    [Route("")]
    public class HomeController : Controller
    {        
        private RaceResultService raceResultService;

        public HomeController([FromServices] IWebHostEnvironment env, RaceResultService diRaceResultService)
        {           
            raceResultService = diRaceResultService;
            raceResultService.RacesFolderFilePath = env.ContentRootPath + "\\races";
        }

        [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
        [Route("error")]
        public IActionResult Error()
        {
            return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
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
