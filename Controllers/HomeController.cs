using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Xml;
using System.Xml.Linq;
using lawrukmvc.Models;
using lawrukmvc.ViewModels;

namespace lawrukmvc.Controllers
{
    [HandleError]
    public class HomeController : Controller
    {
        [OutputCache(Duration = 120, VaryByParam = "none")]
        public ActionResult Index() 
        {            
            var homeViewModel = new HomeViewModel();
            homeViewModel.HomeButtons = GetHomeButtonsList();
            return View(homeViewModel);            
        }

        private List<HomeButton> GetHomeButtonsList()
        {
            var buttons = new List<HomeButton>()
            {
                new HomeButton("About","/about", "http://farm8.staticflickr.com/7273/7503083928_a2974e2861_m.jpg", "About Me"),
                new HomeButton("Metro", "/metro", "http://lawruk.s3.amazonaws.com/images/metro.jpg", "Minutes until the train arrives for Metro stops that I care about"),               
                new HomeButton("Blog", "/blog", "http://farm7.static.flickr.com/6084/6142564278_5573968475_m.jpg", "Boring Blog Posts"),
                new HomeButton("News", "/news", "http://farm4.staticflickr.com/3456/3239806077_373a9b78a1.jpg", "News"),
                new HomeButton("Weather","/weather", "http://lawruk.s3.amazonaws.com/images/sky.jpg", "Weather for where we typically are"),                
                new HomeButton("Videos", "/videos", "http://farm4.staticflickr.com/3603/3378253382_9eb642a331_m.jpg", "Videos")
            };
           
            return buttons;
        }

        [OutputCache(Duration = 60, VaryByParam = "none")]
        public ActionResult About() 
        {                        
            var lawrukRepository = new LawrukRepository();
            int aboutId = 5;
            var blogPost = lawrukRepository.GetBlogPost(aboutId);
            var viewModel = new BlogPostViewModel(blogPost);
            return View(viewModel); 
        }
        public ActionResult Error() { throw new Exception("test error"); }
        public ActionResult Login() { return RedirectToAction("Logon"); }
        public ActionResult Logon() { return RedirectToAction("Logon", "Account"); }
        public ActionResult Logout() { return RedirectToAction("LogOff"); }
        public ActionResult LogOff() { return RedirectToAction("LogOff", "Account"); }
        public ActionResult News() { return View(); }

        [OutputCache(Duration = 60, VaryByParam = "none")]
        public ActionResult Weather() 
        {
            var weatherService = new lawrukmvc.Services.WeatherService();
            return View(weatherService.GetSyndicationItemViewModels());       
        }

        public ActionResult NotFound() { return View("404"); }
        public ActionResult Calendar() { return View(); }
        public ActionResult Running() { return View(); }
        public ActionResult Rpx()
        {
            try
            {
                var token = Request.Form["token"];
                var rpx = new Helpers.Rpx("a00d4647b32434096f453a4a03358b12f8235eb1", "https://rpxnow.com");
                var authInfo = rpx.AuthInfo(token);
                var doc = XDocument.Load(new XmlNodeReader(authInfo));
                Session["displayName"] = doc.Root.Descendants("displayName").First().Value;
                Session["identifier"] = doc.Root.Descendants("identifier").First().Value;
                Session["verifiedEmail"] = doc.Root.Descendants("verifiedEmail").First().Value;
                Session["preferredUsername"] = doc.Root.Descendants("preferredUsername").First().Value;
                Session["rpxXml"] = authInfo.OuterXml;
            }
            catch { }
            return View();           
        }           

    }
}
