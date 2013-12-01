using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using lawrukmvc.Models;
using lawrukmvc.Helpers;

namespace lawrukmvc.ViewModels
{
    public class VideoViewModel : ListItem, ITitleUrl
    {
        public string Title { get; set; }
        public Video Video { get; set; }
        public List<VideoViewModel> RelatedVideos { get; set; }
        public string ThumbnailUrl { get; set; }
        public string YouTubeId { get; set; }      
    }

    public class VideoJSON
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Tags { get; set; }
        public DateTime Date { get; set; }
        public string YouTubeId { get; set; }
        public string Body { get; set; }
    }
      
}