using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using lawrukmvc.ViewModels;

namespace lawrukmvc.Models
{
    public class LawrukRepository
    {
        public lawrukEntities LawrukEntities { get; set; }

        public LawrukRepository()
        {
            LawrukEntities = new lawrukEntities();
        }
     
        public List<ListItem> GetBlogPostViewModels()
        {
            //Set up a list of ViewModels
            List<lawrukmvc.ViewModels.BlogPostViewModel> viewModels = new List<lawrukmvc.ViewModels.BlogPostViewModel>();           

            var blogPosts = from bp in LawrukEntities.BlogPosts
                            where bp.Visibility <= Helpers.Account.Visibility
                            orderby bp.Date descending
                            select new { bp.Id, bp.Title, bp.Date, bp.FlickrImageUrl };            
            
            var items = new List<ListItem>();
            foreach (var b in blogPosts)
            {
                var item = new ListItem();
                item.UrlBasePath = "blog";
                item.Title = b.Title;
                item.Id = b.Id;
                item.ThumbnailUrl = GetBlogThumbnailUrl(b.FlickrImageUrl);
                item.Date = b.Date;
                items.Add(item);
            }           
            return items;
        }

        private string GetBlogThumbnailUrl(string url)
        {           
            if (string.IsNullOrEmpty(url))
            {
                url = "http://farm7.static.flickr.com/6084/6142564278_5573968475.jpg";//default
            }
            url = url.Replace(".jpg", "_m.jpg");
            return url;
        }

        internal Video GetVideo(int id)
        {
            return this.LawrukEntities.Videos.FirstOrDefault(i => i.Id == id);
        }

        internal VideoViewModel GetVideoViewModel(int id)
        {
            var video = GetVideo(id);
            var viewModel = new VideoViewModel();
            viewModel.Title = video.Title;
            viewModel.ThumbnailUrl = "http://i.ytimg.com/vi/" + video.YouTubeId + "/default.jpg";
            viewModel.Date = video.Date;
            viewModel.YouTubeId = video.YouTubeId;
            viewModel.Body = video.Body;
            viewModel.TagList = string.Join(",",video.Tags.Select(t => t.Title).ToArray());
            viewModel.RelatedVideos = new List<VideoViewModel>();
            return viewModel;
        }

        internal List<ListItem> GetVideoViewModels()
        {             
            var viewModels = new List<VideoViewModel>();
            var videos = from v in LawrukEntities.Videos.Where(v=>v.Visibility <= Helpers.Account.Visibility)
                         orderby v.Date descending
                         select new ListItem()
                         {
                             UrlBasePath = "videos",
                             Title = v.Title,
                             Id = v.Id,
                             ThumbnailUrl = "http://i.ytimg.com/vi/" + v.YouTubeId + "/default.jpg",
                             Date = v.Date
                         };
            return videos.ToList();
        }

        internal List<VideoJSON> GetAllVideosJSON()
        {
            var videos = from v in LawrukEntities.Videos                         
                         orderby v.Date descending
                         select new VideoJSON()
                         {
                             Id = v.Id,
                             Title = v.Title,
                             YouTubeId = v.YouTubeId,
                             Body = v.Body,
                             Tags = "",
                             Date = v.Date                   

                         };
            return videos.ToList();
            
        }

        internal List<TagViewModel> GetTagViewModels()
        {
            var viewModels = new List<TagViewModel>();
            var tags = LawrukEntities.Tags;
            foreach (var tag in tags)
            {
                viewModels.Add(new TagViewModel(tag));
            }
            return viewModels;
        }

        private static DateTime Midnight
        {
            get
            {
                DateTime now = DateTime.Now;
                return new DateTime(now.Year, now.Month, now.Day);
            }
        }

        private List<CalendarEntry> GetCalendarEntries()
        {
            return LawrukEntities.CalendarEntries.
                Where(ce => ce.Date > LawrukRepository.Midnight).ToList();
        } 

        private List<CalendarEntry> GetCalendarEntryByType(CalendarEntryType type)
        {
            return LawrukEntities.CalendarEntries.
                Where(ce => ce.Date > LawrukRepository.Midnight && ce.Type == (int)type).ToList();
        }

        public List<CalendarEntryViewModel> GetCalendarEntryViewModels()
        {
            var calendarEntries = GetCalendarEntries();
            return ConvertToViewModels(calendarEntries);
        }

        private List<CalendarEntryViewModel> ConvertToViewModels(List<CalendarEntry> entries)
        {
            var viewModels = new List<CalendarEntryViewModel>();
            foreach (CalendarEntry ce in entries)
            {
                viewModels.Add(new lawrukmvc.ViewModels.CalendarEntryViewModel(ce));
            }
            return viewModels;
        }

        public List<ICalendarEntry> GetPersonViewModels()
        {
            var people = LawrukEntities.People.Where(p => p.BirthdayMonth.HasValue);
            var viewModels = new List<PersonViewModel>();
            foreach (Person person in people)
            {
                viewModels.Add(new PersonViewModel(person));
            }
            return viewModels.Cast<ICalendarEntry>().ToList();
        }

        public List<ICalendarEntry> GetICalendarEntries()
        {            
            var viewModels = new List<lawrukmvc.Models.ICalendarEntry>();
            var calendarEntries = GetCalendarEntryViewModels();
            viewModels.AddRange(calendarEntries);
            var persons = GetPersonViewModels();
            viewModels.AddRange(persons);            
            return viewModels.OrderBy(ce => ce.Date).ToList();
        }
       
         public List<ICalendarEntry> GetICalendarEntriesByType(CalendarEntryType type)
        {
            if (CalendarEntryType.Birthday == type)
            {
                return GetPersonViewModels();
            }
            else
            {
                var entries =  GetCalendarEntryByType(type);
                return ConvertToViewModels(entries).Cast<ICalendarEntry>().ToList();
            }
        }

         public void SaveTags(Video video, string tags)
         {
             string[] tagList = tags.ToLower().Split(',');
             video.Tags.Clear();

             foreach (string tagString in tagList)
             {
                 Tag tag;
                 var tagItem = LawrukEntities.Tags.FirstOrDefault(t => t.Title.ToLower() == tagString);
                 if (tagItem != null)
                 {
                     tag = tagItem;
                 }
                 else
                 {
                     tag = CreateTag(tagString);
                 }
                 video.Tags.Add(tag);
             }
         }

         public Tag CreateTag(string title)
         {
             Tag tag = new Tag();
             tag.Title = title;
             LawrukEntities.Tags.AddObject(tag);
             LawrukEntities.SaveChanges();
             return tag;
         }

        
    }
}
