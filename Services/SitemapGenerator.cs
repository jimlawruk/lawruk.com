using Lawruk.Services;
using System.Text.Json;
using System.Xml.Linq;

namespace Lawruk.Services
{
    public class SitemapGenerator
    {
        private RaceResultService raceResultService;
        private readonly string siteMetaFilePath;

        public SitemapGenerator(IWebHostEnvironment env, RaceResultService diRaceResultService)
        {
            raceResultService = diRaceResultService;
            siteMetaFilePath = Path.Combine(env.ContentRootPath, "client-app", "public", "site.meta.json");
        }

        public string GenerateSitemap()
        {
            var baseUrl = "https://www.lawruk.com";
            var ns = XNamespace.Get("http://www.sitemaps.org/schemas/sitemap/0.9");
            var xml = new XDocument(
                new XDeclaration("1.0", "utf-8", null),
                new XElement(ns + "urlset",
                    new XAttribute("xmlns", ns.NamespaceName),
                    GenerateSitemapEntries(baseUrl, ns)
                )
            );
            return xml.ToString();
        }

        private IEnumerable<XElement> GenerateSitemapEntries(string baseUrl, XNamespace ns)
        {
            var entries = new List<XElement>();
            var addedUrls = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            void AddUrl(string url, DateTime lastModified)
            {
                if (addedUrls.Add(url))
                {
                    entries.Add(CreateUrlElement(ns, url, lastModified));
                }
            }

            // Add home page
            AddUrl(baseUrl + "/", DateTime.Now);

             // Add site meta links
            foreach (var siteMetaEntry in GetSiteMetaEntries(baseUrl))
            {
                AddUrl(siteMetaEntry.Url, siteMetaEntry.LastModified);
            }

            // Add race results page
            AddUrl(baseUrl + "/race-results", DateTime.Now);

            // Add individual race results
            var raceResults = raceResultService.GetRaceResultsViewModel();
            foreach (var race in raceResults.RaceResults)
            {
                AddUrl(baseUrl + race.Url, race.DateTime);
            }           

            return entries;
        }

        private IEnumerable<(string Url, DateTime LastModified)> GetSiteMetaEntries(string baseUrl)
        {
            if (!File.Exists(siteMetaFilePath))
                yield break;

            var lastModified = File.GetLastWriteTimeUtc(siteMetaFilePath).Date;
            var jsonText = File.ReadAllText(siteMetaFilePath);

            using var document = JsonDocument.Parse(jsonText);
            if (!document.RootElement.TryGetProperty("items", out var itemsElement) || itemsElement.ValueKind != JsonValueKind.Array)
                yield break;

            foreach (var item in itemsElement.EnumerateArray())
            {
                if (!item.TryGetProperty("link", out var linkElement) || linkElement.ValueKind != JsonValueKind.String)
                    continue;

                var link = linkElement.GetString();
                if (string.IsNullOrWhiteSpace(link))
                    continue;

                if (Uri.TryCreate(link, UriKind.Relative, out var relativeUri) && link.StartsWith("/"))
                {
                    yield return (baseUrl + link.TrimEnd('/'), lastModified);
                }
            }
        }

        private XElement CreateUrlElement(XNamespace ns, string url, DateTime lastModified)
        {
            return new XElement(ns + "url",
                new XElement(ns + "loc", url),
                new XElement(ns + "lastmod", lastModified.ToString("yyyy-MM-dd"))
            );
        }
    }
}
