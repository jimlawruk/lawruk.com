namespace Lawruk.Models
{
    public class RaceViewModel : PageViewModel
    {
        public string Title { get; set; }
        public string? Url { get; set; }
        public string Distance { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public string Text { get; set; }
        public int Id { get; set; }
        public bool Edit { get; set; }
        public string TimeText { get; set; }
    }
}
