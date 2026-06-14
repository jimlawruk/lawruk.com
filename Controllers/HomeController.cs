using Microsoft.AspNetCore.Mvc;
using Lawruk.Models;
using Lawruk.Services;

namespace Lawruk.Controllers
{
    [ApiController]
    [Route("api")]
    public class HomeController : ControllerBase
    {
        private SitemapGenerator SitemapGenerator;
        private RaceResultService RaceResultService;
        private RecipeService RecipeService;

        public HomeController([FromServices] IWebHostEnvironment env, SitemapGenerator sitemapGenerator, RaceResultService raceResultService, RecipeService recipeService)
        {
            SitemapGenerator = sitemapGenerator;
            RaceResultService = raceResultService;
            RaceResultService.RacesFolderFilePath = env.ContentRootPath + "\\races";
            RecipeService = recipeService;
            RecipeService.RecipesFolderFilePath = env.ContentRootPath + "\\recipes";
        }

        [Route("race-results")]
        [HttpGet]
        public IActionResult RaceResults()
        {
            var result = RaceResultService.GetRaceResultsViewModel();            
            return Ok(result);
        }

        [Route("race-results/{url}")]
        [HttpGet]
        public IActionResult Race(string url)
        {
            var raceViewModel = RaceResultService.GetRaceViewModelWithTextByUrl(url);
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
            var result = RecipeService.GetRecipeResultsViewModel();
            return Ok(result);
        }

        [Route("recipes/{title}")]
        [HttpGet]
        public IActionResult Recipe(string title)
        {
            var recipe = RecipeService.GetRecipeBySlug(title);
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

        [Route("sitemap")]
        [HttpGet]
        public IActionResult Sitemap()
        {
            var xmlString = SitemapGenerator.GenerateSitemap();
            return Content(xmlString, "application/xml");
        }
    }
}

