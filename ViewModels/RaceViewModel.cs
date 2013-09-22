using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using lawrukmvc.Models;
using lawrukmvc.Helpers;

namespace lawrukmvc.ViewModels
{
    public class RaceViewModel
    {        
        public List<RaceViewModel> OtherYears { get; set; }
        public List<RaceViewModel> RelatedRaces { get; set; }
        public string Title { get; set; }
        public string Url { get; set; }
        public string Distance { get; set; }
        public string City { get; set; }
        public string State { get; set; }
        public DateTime DateTime { get; set; }
        public string Text { get; set; }

        public int Id {get;set;}
        public bool Edit { get; set; }
        public string TimeText { get;set;}    
        

        public string DisplayDate
        {
            get
            {
                return Helpers.Date.GetShortDisplay(this.DateTime);
            }
        }


        public string EditLink
        {
            get
            {
               if (Edit && Id > 0) 
               {
                 return "<a href=\"/races/edit/" + Id + "\">Edit</a>";
               }
               return "";
            }
        }
        

    }
}