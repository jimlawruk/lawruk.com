using Microsoft.AspNetCore.Mvc;

namespace Lawruk.Controllers
{
    [Route("")]
    public class OgMetaController : ControllerBase
    {
        private readonly IWebHostEnvironment _env;

        private static readonly Dictionary<string, (string Title, string Description, string Image)> PageMeta = new()
        {
            ["boston-marathon"] = (
                "Boston Marathon Course Map",
                "Interactive map of the iconic 26.2-mile Boston Marathon course with elevation profile, mile markers, Heartbreak Hill, and Google Street View.",
                "/img/blog/boston-marathon_504x672.png"
            ),
            ["haunted-places"] = (
                "Haunted Places in America",
                "Interactive map of haunted places across the United States powered by a dataset of thousands of reported hauntings.",
                "/img/blog/haunted-places_150x200.png"
            ),
            ["camp-hill-street-lights"] = (
                "Camp Hill Street Lights",
                "Interactive map visualizing street light locations throughout Camp Hill, PA.",
                "/img/blog/camp-hill-street-lights_504x672.png"
            ),
            ["blog/traffic-disparities-in-pa-due-to-solar-eclipse"] = (
                "Traffic Disparities in PA Due to Solar Eclipse",
                "Data analysis and interactive map showing how the 2024 solar eclipse affected traffic patterns across Pennsylvania.",
                "/img/blog/traffic-disparities-in-pa-due-to-solar-eclipse_150x200.png"
            ),
        };

        public OgMetaController(IWebHostEnvironment env) => _env = env;

        [HttpGet("boston-marathon")]
        [HttpGet("haunted-places")]
        [HttpGet("camp-hill-street-lights")]
        [HttpGet("blog/traffic-disparities-in-pa-due-to-solar-eclipse")]
        public async Task<IActionResult> ServeWithOgTags()
        {
            var route = Request.Path.Value?.TrimStart('/') ?? string.Empty;
            if (!PageMeta.TryGetValue(route, out var meta))
                return NotFound();

            var indexPath = Path.Combine(_env.WebRootPath, "index.html");
            if (!System.IO.File.Exists(indexPath))
                return NotFound();

            var html = await System.IO.File.ReadAllTextAsync(indexPath);

            var baseUrl = $"{Request.Scheme}://{Request.Host}";
            var ogTags = $"""
        <meta property="og:title" content="{meta.Title}" />
        <meta property="og:description" content="{meta.Description}" />
        <meta property="og:image" content="{baseUrl}{meta.Image}" />
        <meta property="og:url" content="{baseUrl}/{route}" />
        <meta property="og:type" content="website" />
""";

            html = html.Replace("</head>", $"{ogTags}  </head>");

            return Content(html, "text/html");
        }
    }
}
