using Microsoft.AspNetCore.Mvc;
using Lawruk.Models;
using Lawruk.Services;

namespace Lawruk.Controllers
{
    [ApiController]
    [Route("api")]
    public class HomeController : ControllerBase
    {        
        private RaceResultService raceResultService;

        public HomeController([FromServices] IWebHostEnvironment env, RaceResultService diRaceResultService)
        {           
            raceResultService = diRaceResultService;
            raceResultService.RacesFolderFilePath = env.ContentRootPath + "\\races";
        }

        [Route("race-results")]
        [HttpGet]
        public IActionResult RaceResults()
        {
            var vm = raceResultService.GetRaceResultsViewModel();
            var result = vm.RaceResults.Select(r => new {
                title = r.Title,
                url = r.Url,
                distance = r.Distance,
                city = r.City,
                state = r.State,
                dateTimeDisplay = r.DateTimeDisplay,
                gpxBaseFileName = r.GpxBaseFileName
            });
            return Ok(result);
        }

        [Route("race-results/{url}")]
        [HttpGet]
        public IActionResult Race(string url)
        {
            var raceViewModel = raceResultService.GetRaceViewModelWithTextByUrl(url);
            if (raceViewModel != null)
            {
                return Ok(new {
                    title = raceViewModel.Title,
                    url = raceViewModel.Url,
                    distance = raceViewModel.Distance,
                    city = raceViewModel.City,
                    state = raceViewModel.State,
                    dateTimeDisplay = raceViewModel.DateTimeDisplay,
                    gpxBaseFileName = raceViewModel.GpxBaseFileName,
                    text = raceViewModel.Text
                });
            }
            return NotFound();
        }       
    }
}

