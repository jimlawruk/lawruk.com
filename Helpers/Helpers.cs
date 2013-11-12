using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ServiceModel.Syndication;
using System.Data;
using System.Xml;
using System.Globalization;
using lawrukmvc.Models;
using lawrukmvc.ViewModels;

namespace lawrukmvc.Helpers
{
    public static class Helpers
    {
        public static string ValueOrDefault(string value, string defaultValue)
        {
            return !string.IsNullOrEmpty(value) ? value : defaultValue;
        }

        public static string ValueOrBlank(bool condition, string value)
        {
            if (condition)
            {
                return value;
            }
            else
            {
                return "";
            }
        }        

        public static string DownloadString(string url)
        {

            string response;
            using (System.Net.WebClient wc = new System.Net.WebClient())
            {
                response = wc.DownloadString(url);
            }
            return response;
        }

        public static List<SyndicationItemViewModel> GetRSSList(string rssUrl, int maxItems, bool displaySummary)
        {
            List<SyndicationItem> syndicationItems = lawrukmvc.Helpers.RSS.GetListFromRSSFeed(rssUrl);
            syndicationItems = syndicationItems.Take(maxItems).ToList();
            return GetSyndicationItemViewModels(syndicationItems, displaySummary);
        }

        public static List<SyndicationItemViewModel> GetSyndicationItemViewModels(List<SyndicationItem> syndicationItems, bool displaySummary)
        {
            List<SyndicationItemViewModel> rssDisplayItems = new List<SyndicationItemViewModel>();
            foreach (SyndicationItem item in syndicationItems)
            {
                var syndicationViewModelItem = new SyndicationItemViewModel(item);
                syndicationViewModelItem.DisplaySummary = displaySummary;
                rssDisplayItems.Add(syndicationViewModelItem);
            }
            return rssDisplayItems; 
        }

        public static List<SyndicationItemViewModel> GetRSSList(string rssUrl, int maxItems)
        {
            return GetRSSList(rssUrl, maxItems, true);
        }        

        public static List<PhotoViewModel> GetPhotos(string tags, int maxItems)
        {
            //Check cache first
            string cacheKey = "getPhotos_" + tags;
            List<PhotoViewModel> photos = Cache.GetItem<List<PhotoViewModel>>(cacheKey);
            if (photos != null)
                return photos;

            photos = new List<PhotoViewModel>(); 

            XmlTextReader reader = new XmlTextReader("http://api.flickr.com/services/feeds/photos_public.gne?tags=" + tags);
            DataSet ds = new DataSet();
            ds.ReadXml(reader);
            if (ds.Tables.Count <= 4)
            {
                return photos;
            }
            DataTable dataTable = ds.Tables[3];
            DataTable dataTable4 = ds.Tables[4];

            int i = 0;
            foreach (DataRow row in dataTable.Rows)
            {
                string imgUrl = "";
                string title = "";
                string dateTaken = "";

                title = row[0].ToString();
                dateTaken = row[4].ToString();
                imgUrl = dataTable4.Rows[i][1].ToString();
                imgUrl = imgUrl.Substring(imgUrl.IndexOf("<img", 0));
                imgUrl = imgUrl.Substring(0, imgUrl.IndexOf("width=", 0)) + "/>";
                imgUrl = imgUrl.Replace("_m.jpg", ".jpg");
                imgUrl =imgUrl.Replace("<img src=\"","");
                imgUrl = imgUrl.Replace("\" />", "");

                Photo photo = new Photo(imgUrl);
                PhotoViewModel photoViewModel = new PhotoViewModel(photo);
                photoViewModel.Index = i;
                photos.Add(photoViewModel);
                i = i + 1;
            }
            Cache.InsertItem(cacheKey, photos);

            return photos;
        }        

        public static string ToUrl(this String str)
        {
            char[] replaceChars = { '\'', '!', '@', '#', '&', '-' };
            foreach (char c in replaceChars)
            {
                if (replaceChars.Contains(c))
                {
                    str = str.Replace(c.ToString(),"");
                }
            }
            return str.Replace("   "," ").Replace("  "," ").Replace(" ", "-").ToLower();
        }

        public static string P(string s)
        {
            if (!string.IsNullOrEmpty(s))
            {
                return "<p>" + s + "</p>";
            }
            return "";
        }

        public static string P(string fieldName, string s)
        {
            if (!string.IsNullOrEmpty(s))
            {
                return "<p><strong>" + fieldName + ":</strong> " + s + "</p>";
            }
            return "";

        }

        public static string Img(string url)
        {
            if (!string.IsNullOrEmpty(url))
            {
                return "<img src=\"" + url + "\"/>";
            }
            return "";
        }

        public static string A(ITitleUrl titleUrl)
        {
            return A(titleUrl.Title, titleUrl.Url);
        }

        public static string A(string title, string url)
        {
            return "<a href=\"" + url + "\">" + title + "</a>";
        }

        public static string ULAList(List<ITitleUrl> links)
        {
            string s = "<ul>";
            foreach (ITitleUrl titleUrl in links)
            {
                s += "<li>" + A(titleUrl) + "</li>";
            }
            s += "</ul>";
            return s;
        }

        public static string UrlList(string s)
        {
            if (!string.IsNullOrEmpty(s))
            {
                var list = s.Split('|');
                var linkList = new List<ITitleUrl>();
                foreach (string value in list)
                {
                    string title = value.Replace("http://", "");
                    string url = value;
                    if (value.Contains('^'))
                    {
                        var titleUrl = url.Split('^');
                        title = titleUrl[0];
                        url = titleUrl[1].ToLower();
                        if (!url.Contains("http"))
                        {
                            url = "http://" + url;
                        }
                        
                    }
                    linkList.Add(new TitleUrl(title,url));
                }
                return Helpers.ULAList(linkList);
            }
            return "";
        }

        public static string BothOrEmpty(string s1, string s2)
        {
            if (!string.IsNullOrEmpty(s1) && !string.IsNullOrEmpty(s2))
            {
                return s1 + s2;
            }
            return "";
        }

        public static string TitleCase(string s)
        {
            return System.Threading.Thread.CurrentThread.CurrentCulture.TextInfo.ToTitleCase(s);
        }

        public static TitleUrlListViewModel GetViewModelFromList(List<ITitleUrl> items)
        {
            var viewModel = new TitleUrlListViewModel();
            viewModel.TitleUrls = items;
            return viewModel;
        }

        public static TitleUrlListViewModel ConvertMetroStations(List<MetroStation> stations)
        {
            var viewModel = new TitleUrlListViewModel();
            viewModel.TitleUrls = stations.Cast<ITitleUrl>().ToList();
            return viewModel;
        }

        


    }
}