using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Xml;
using System.Data;
using System.Text.RegularExpressions;
using lawrukmvc.Helpers;
using lawrukmvc.Models;
using lawrukmvc.ViewModels;

namespace lawrukmvc.Controllers
{
    public class NewsController : Controller
    {
        INewsService newsService;

        public NewsController(INewsService newsService)
        {
            this.newsService = newsService;
        }

        public ActionResult Index()
        {
            return View(GetNewsViewModel(""));
        }

        public ActionResult Detail(string tag)
        {
            return View(GetNewsViewModel(tag));
        }

        private NewsViewModel GetNewsViewModel(string tag)
        {
            var newsViewModel = new NewsViewModel();
            newsViewModel.RSSFeeds = newsService.GetNewsSources();
            newsViewModel.CurrentRSSFeed = newsService.GetNewsFeedUrl(tag);
            newsViewModel.TitleUrlListViewModel = GetOtherNews(newsViewModel.RSSFeeds);
            return newsViewModel;
        }

        private TitleUrlListViewModel GetOtherNews(List<TagTitleUrl> rssFeeds)
        {
            var titleUrlList = new TitleUrlListViewModel();
            titleUrlList.Title = "Other News";
            titleUrlList.TitleUrls = new List<ITitleUrl>();
            foreach (var rssFeed in rssFeeds)
            {
                var titleUrl = new TitleUrl(rssFeed.Title, "/news/" + rssFeed.Tag);
                titleUrlList.TitleUrls.Add(titleUrl);
            }
            return titleUrlList;
        }
    }
}