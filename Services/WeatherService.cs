using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ServiceModel.Syndication;
using lawrukmvc.Helpers;
using lawrukmvc.ViewModels;

namespace lawrukmvc.Services
{
    public class WeatherService
    {

        public List<SyndicationItemViewModel> GetSyndicationItemViewModels()
        {
            int[] woeids = new int[] { 2363527, 2399451, 2450407, 2364363 };//Bethesda, Emmaus, Middletown, Binghamton

            var syndicationItems = new List<SyndicationItem>();
            foreach (var woeid in woeids)
            {
                var placeUrl = string.Format("http://weather.yahooapis.com/forecastrss?w={0}", woeid);
                var item = Helpers.RSS.GetListFromRSSFeed(placeUrl)[0];
                syndicationItems.Add(item);
            }
            var viewModels = Helpers.Helpers.GetSyndicationItemViewModels(syndicationItems, true);
            return viewModels.Select(vm => { vm.Title = string.Join(" ", vm.Title.Split(' ').Take(3)); return vm; }).ToList();
        }
    }
}