using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.IO;
using System.Web.Configuration;
using lawrukmvc.Models;
using lawrukmvc.ViewModels;
using lawrukmvc.Helpers;
using System.Data;
using System.Data.Objects.DataClasses;

namespace lawrukmvc.Controllers
{

    public class RacesController : BaseController
    {
        private RaceLogic raceLogic = new RaceLogic();

        public ActionResult Results(string extension)
        {
            return Index(extension);
        }        

        public ActionResult Race(string urlTitle, string year)
        {            
            var raceViewModel = raceLogic.GetRaceViewModelByUrl(urlTitle);
            if (raceViewModel != null)
                return View(raceViewModel);
            else
                return new HttpNotFoundResult();
        }        

        public override EntityObject NewItem()
        {
            var raceResult = new RaceResult();
            var dateTime = DateTime.Now;
            raceResult.Date = new DateTime(dateTime.Year, dateTime.Month, dateTime.Day);
            return raceResult;
        }

        public override EntityObject GetItem(int id)
        {
            return lawrukRepository.LawrukEntities.RaceResults.First(r => r.Id == id);     
        }

        public override object GetDetailModel(int id)
        {
            throw new NotImplementedException();
        }

        public override EntityObject PopulateItem(EntityObject item)
        {
            RaceResult raceResult = item as RaceResult;
            raceResult.Title = Request.Params["title"];
            raceResult.Date = DateTime.Parse(Request.Params["date"]);
            raceResult.Url = Request.Params["urllink"];
            raceResult.Distance = Request.Params["distance"];
            raceResult.City = Request.Params["city"];
            raceResult.State = Request.Params["state"];
            string time = Request.Params["time"];
            if (!string.IsNullOrEmpty(time))
            {                
                int[] ssmmhh = {0,0,0};
                var hhmmss = time.Split(':');
                var reversed = hhmmss.Reverse();
                int i = 0;
                reversed.ToList().ForEach(x=> ssmmhh[i++] = int.Parse(x));                           
                raceResult.Seconds = (int)(new TimeSpan(ssmmhh[2], ssmmhh[1], ssmmhh[0])).TotalSeconds;   
            }
            return raceResult;
        }

        public override object GetListModel(bool editMode)
        {
            var races = raceLogic.GetRaceViewModels();
            races.ForEach(r => r.Text = "");//Clear text for .json response
            races.ForEach(r => r.Edit = editMode);
            return races;
        }

        protected override string ListView
        {
            get { return "Results"; }
            set { return;  } 
        }        
       
    }//class
}//namespace
