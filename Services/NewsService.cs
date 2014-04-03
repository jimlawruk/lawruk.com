using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using lawrukmvc.Models;

namespace lawrukmvc.Services
{
    public class NewsService : INewsService
    {
        public List<TagTitleUrl> GetNewsSources()
        {
            var rssFeeds = new List<TagTitleUrl>()
            {             
             { new TagTitleUrl("latest", "Latest News", "http://rss.news.yahoo.com/rss/topstories")},       
             { new TagTitleUrl("steelers", "Steelers", "http://www.steelersdepot.com/feed/")},
             { new TagTitleUrl("golf","Golf", "http://www.golfdigest.com/services/rss/feeds/news.xml")},
             
             { new TagTitleUrl("sports","Sports", "http://rss.news.yahoo.com/rss/sports")},
             { new TagTitleUrl("economy","Economy", "http://rss.news.yahoo.com/rss/economy")},
             { new TagTitleUrl("heart","Heart", "http://www.medicalnewstoday.com/rss/heart-disease.xml")},
             { new TagTitleUrl("catholic", "Catholic", "http://www.catholic.org/xml/rss_top_news.xml")}
            };
            return rssFeeds;
        }

        public TagTitleUrl GetNewsFeedUrl(string tag)
        {
            tag = tag.ToLower();
            if (string.IsNullOrEmpty(tag))
                tag = "latest";

            return GetNewsSources().Find(r => r.Tag == tag);
        }         
    }
}