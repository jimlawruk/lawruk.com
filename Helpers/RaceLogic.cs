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
            var raceViewModels = GetRaceViewModelsFromDatabaseResults();
            var raceFileViewModels = GetRaceViewModelsFromRaceFiles();
            foreach (var viewModel in raceViewModels)
            {                
                var match = raceFileViewModels.FirstOrDefault(r=> r.DateTime.DayOfYear == viewModel.DateTime.DayOfYear 
                                                                && r.DateTime.Year == viewModel.DateTime.Year
                                                                && r.Distance == viewModel.Distance);
                if (match != null)
                {
                    raceFileViewModels.Remove(match);   
                }
            }
            return raceViewModels.Union(raceFileViewModels).OrderByDescending(r => r.DateTime).ToList();         
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
                try
                {
                    raceViewModels.Add(GetViewModelFromRaceFile(raceFile));
                }
                catch { }
            }
            return raceViewModels;
        
        }
            
        private RaceViewModel GetViewModelFromRaceFile(string raceFilename)
        {
            var raceViewModel = new RaceViewModel();
            string[] array = raceFilename.Split('-');
            int year = int.Parse(array[0].Substring(0, 4));
            int month = int.Parse(array[0].Substring(4, 2));
            int day = int.Parse(array[0].Substring(6, 2));
            raceViewModel.DateTime = new DateTime(year, month, day);
            raceViewModel.Distance = array[1];
            raceViewModel.Title = array[2].Replace("_", " ");
            raceViewModel.Url = "/races/" + raceFilename.Replace(".txt", "");
            raceViewModel.City = array[3].Replace("_", " ");
            string state = array[4];
            if (state.Contains("."))
            {
                state = state.Substring(0, state.IndexOf('.'));
            }
            raceViewModel.State = state;            
            raceViewModel.RelatedRaces = new List<RaceViewModel>();
            try
            {
                raceViewModel.Text = GetTextFromRaceFile(raceFilename);
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

        private List<string> GetRaceFiles()
        {
            var raceFileNames = new List<string>();
            string path = RacePath;
            
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
                    raceFileNames.Add(fi.Name);
                }
                catch { }
            }
            return raceFileNames;
        }

        internal string RacePath
        {
            get { return WebConfigurationManager.AppSettings["RootDirectory"] + "\\Races";}
        }

        internal string GetRaceFileNameFromUrl(string url)
        {
            var raceFileName = string.Format("{0}.txt", url);
            var raceFilePath = string.Format("{0}\\{1}.txt", RacePath, url);
            if (File.Exists(raceFilePath))
                return raceFileName;
            else
                return null;
        }

        private List<RaceResult> GetDatabaseRaces()
        {
            var lawrukEntities = new lawrukEntities();
            return lawrukEntities.RaceResults.ToList();
        }

        internal RaceViewModel GetRaceViewModelByUrl(string urlTitle)
        {
            var raceFile = GetRaceFileNameFromUrl(urlTitle);
            if (raceFile != null)
                return GetViewModelFromRaceFile(raceFile);
            else
                return null;
        }

        internal string GetTextFromRaceFile(string fileName)
        {
            string text;
            using (var sr = new StreamReader(RacePath + "\\" + fileName))
            {
                text = sr.ReadToEnd();
            }
            return text;
        }
    }
}