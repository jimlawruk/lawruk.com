using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Configuration;
using System.IO;
using lawrukmvc.Models;
using lawrukmvc.ViewModels;

namespace lawrukmvc.Helpers
{
    public class RaceLogic
    {
        internal List<RaceViewModel> GetRaceViewModels()
        {            
            var databaseRaceViewModels = GetRaceViewModelsFromDatabaseResults();
            var raceFileViewModels = GetRaceViewModelsFromRaceFiles();
            foreach (var viewModel in databaseRaceViewModels)
            {
                var match = raceFileViewModels.FirstOrDefault(r=> r.DateTime.DayOfYear == viewModel.DateTime.DayOfYear 
                                                                && r.DateTime.Year == viewModel.DateTime.Year
                                                                && r.Distance == viewModel.Distance);
                if (match != null)
                {
                    raceFileViewModels.Remove(match);   
                }
            }
            return databaseRaceViewModels.Union(raceFileViewModels).ToList();            
        }

        private List<RaceViewModel> GetRaceViewModelsFromDatabaseResults()
        {
            var raceViewModels = new List<RaceViewModel>();
            foreach (var raceResult in GetDatabaseRaces())
            {
                raceViewModels.Add(GetViewModelFromRaceResult(raceResult));
            }
            return raceViewModels;
        }
        

        private List<RaceViewModel> GetRaceViewModelsFromRaceFiles()
        {
            var raceViewModels = new List<RaceViewModel>();
            foreach (var raceFile in GetRaceFiles())
            {
                raceViewModels.Add(GetViewModelFromRaceFile(raceFile));
            }
            return raceViewModels;
        
        }
            
        private RaceViewModel GetViewModelFromRaceFile(RaceFile raceFile)
        {
            var raceViewModel = new RaceViewModel();
            string trip = "1-3 of 3 trip";
            string[] array = trip.Split(' ');
            int theNumberYouWant = int.Parse(array[2]);
            raceViewModel.Title = raceFile.Title;
            raceViewModel.Url = "/races/" + raceFile.Filename.Replace(".txt","");
            raceViewModel.Distance = raceFile.Distance;
            raceViewModel.City = raceFile.City;
            raceViewModel.State = raceFile.State;
            raceViewModel.DateTime = raceFile.Date;           
            
            raceViewModel.RelatedRaces = new List<RaceViewModel>();
            try
            {
                raceViewModel.Text = raceFile.GetText();
                if (raceViewModel.Text.IndexOf("<pre") == 0)
                {
                    string[] lines = raceViewModel.Text.Split('\n');
                    foreach (var line in lines)
                    {
                        if (line.Contains("J") && line.Contains("Lawruk"))
                        {
                            string[] fields = line.Split(' ');
                            raceViewModel.TimeText = fields[fields.Length - 4];
                        }
                    }
                }
            }
            catch { }
            return raceViewModel;
        }

        public RaceViewModel GetViewModelFromRaceResult(RaceResult raceResult)
        {
            var raceViewModel = new RaceViewModel();
            raceViewModel.Id = raceResult.Id;
            raceViewModel.Title = raceResult.Title;
            raceViewModel.Url = raceResult.Url;
            raceViewModel.Distance = raceResult.Distance;
            raceViewModel.City = raceResult.City;
            raceViewModel.State = raceResult.State;
            raceViewModel.DateTime = raceResult.Date;
            raceViewModel.TimeText = raceResult.Seconds > 0 ? lawrukmvc.Helpers.Date.GetHHMMSSFromSeconds(raceResult.Seconds) : "";
            raceViewModel.RelatedRaces = new List<RaceViewModel>();
            return raceViewModel;
        }

        private List<RaceFile> GetRaceFiles()
        {
            var raceFiles = new List<RaceFile>();
            string path = WebConfigurationManager.AppSettings["RootDirectory"] + "\\Races";
            if (System.Web.HttpContext.Current.Request.Url.Host.Contains("localhost"))
            {
                //TODO Cean this up
                path = "C:\\Users\\Jim\\Documents\\lawruk.com\\Races";
            }
            var di = new DirectoryInfo(path);
            foreach (FileInfo fi in di.GetFiles())
            {
                try
                {
                    string name = fi.Name.ToLower();
                    if (name.Contains("-allison") || name.Contains("-none"))
                    {
                        continue;
                    }
                    RaceFile race = new RaceFile(fi.Name);
                    string[] array = fi.Name.Split('-');
                    int year = int.Parse(array[0].Substring(0, 4));
                    int month = int.Parse(array[0].Substring(4, 2));
                    int day = int.Parse(array[0].Substring(6, 2));
                    race.Date = new DateTime(year, month, day);
                    race.Distance = array[1];
                    race.Title = array[2].Replace("_", " ");
                    race.City = array[3].Replace("_", " ");
                    string state = array[4];
                    if (state.Contains("."))
                    {
                        state = state.Substring(0, state.IndexOf('.'));
                    }
                    race.State = state;
                    raceFiles.Add(race);
                }
                catch { }
            }
            return raceFiles;
        }

        private List<RaceResult> GetDatabaseRaces()
        {
            var lawrukEntities = new lawrukEntities();
            return lawrukEntities.RaceResults.ToList();
        }

        internal RaceViewModel GetRaceByUrl(string urlTitle)
        {
            var raceFile = GetRaceFiles().Where(r => r.Filename == urlTitle + ".txt").FirstOrDefault();
            if (raceFile != null)
                return GetViewModelFromRaceFile(raceFile);
            else
                return null;
        }
    }
}