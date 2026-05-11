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
        private RecipeService recipeService;

        public HomeController([FromServices] IWebHostEnvironment env, RaceResultService diRaceResultService, RecipeService diRecipeService)
        {           
            raceResultService = diRaceResultService;
            raceResultService.RacesFolderFilePath = env.ContentRootPath + "\\races";
            recipeService = diRecipeService;
            recipeService.RecipesFolderFilePath = env.ContentRootPath + "\\recipes";
        }

        [Route("race-results")]
        [HttpGet]
        public IActionResult RaceResults()
        {
            var result = raceResultService.GetRaceResultsViewModel();            
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

        [Route("recipes")]
        [HttpGet]
        public IActionResult Recipes()
        {
            var result = recipeService.GetRecipeResultsViewModel();
            return Ok(result);
        }

        [Route("recipes/{title}")]
        [HttpGet]
        public IActionResult Recipe(string title)
        {
            var recipe = recipeService.GetRecipeBySlug(title);
            if (recipe == null)
            {
                return NotFound();
            }

            return Ok(new {
                slug = recipe.Slug,
                title = recipe.Title,
                serves = recipe.Serves,
                ingredients = recipe.Ingredients,
                instructions = recipe.Instructions
            });
        }
    }
}

