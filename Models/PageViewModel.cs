using Microsoft.AspNetCore.Mvc.RazorPages;

namespace Lawruk.Models
{
    public class PageViewModel: PageModel
    {
        public string? PageTitle { get; set; }
        public string? PageType { get; set; }
        public bool ShowPageTitle { get; set; }
        public string? Author { get; set; }
        public DateTime DateTime { get; set; }
        public string DateTimeFormat { get; set; }
        public string? OpenGraphImageUrl { get; set; }
        public string? BodyClass { get; set; }

        public PageViewModel()
        {
            ShowPageTitle = true;
            DateTimeFormat = "MMMM dd, yyyy";
        }

        public string DateTimeDisplay
        {
            get
            {
                return DateTime.ToString(DateTimeFormat);
            }
        }
    }
}
