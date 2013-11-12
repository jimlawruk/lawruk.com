using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.ServiceModel.Syndication;

namespace lawrukmvc.ViewModels
{

    public class SyndicationItemViewModel
    {
        SyndicationItem SyndicationItem { get; set; }

        public SyndicationItemViewModel(SyndicationItem item)
        {
            SyndicationItem = item;
            Title = SyndicationItem.Title.Text;
        }

        public string Title { get; set; }
        public string Url { 
            get {
                return Helpers.Helpers.ValueOrBlank(SyndicationItem.Links.Count > 0, SyndicationItem.Links[0].Uri.ToString());
            }
        }
                
        public string DisplayDate
        {
            get
            {
                if (SyndicationItem.PublishDate.Year > 1900)
                {
                    DateTimeOffset date = SyndicationItem.PublishDate;
                    string displayDate = Helpers.Date.GetMonthName(date.Month);
                    displayDate += " " + date.Day + ", " + date.Year;
                    return displayDate;
                }
                else
                    return "";
            }
        }

        public string Summary { get { return SyndicationItem.Summary.Text; } }
        public bool DisplaySummary { get; set; }
    }
}