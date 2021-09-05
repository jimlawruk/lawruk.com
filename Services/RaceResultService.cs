using System;
using System.IO;
using System.Linq;
using System.Collections.Generic;
using Lawruk.Models;

namespace Lawruk.Services
{
    public class RaceResultService
    {
        public string RacesFolderFilePath { get; set; }

        public RaceResultsViewModel GetRaceResultsViewModel()
        {
            var raceResultsViewModel = new RaceResultsViewModel();
            raceResultsViewModel.PageTitle = "Race Results";
            raceResultsViewModel.DateTimeFormat = "yyyy-mmm-dd";
            raceResultsViewModel.RaceResults = GetRaceViewModelsFromRaceFiles();
            return raceResultsViewModel;
        }

        private List<RaceViewModel> GetRaceViewModelsFromRaceFiles()
        {
            var raceViewModels = new List<RaceViewModel>();
            foreach (var raceFileName in GetRaceFileNames())
            {
                raceViewModels.Add(GetViewModelFromRaceFile(raceFileName));
            }
            raceViewModels = raceViewModels.OrderByDescending(x => x.DateTime).ToList();
            return raceViewModels;
        }

        public RaceViewModel GetRaceViewModelWithTextByUrl(string urlTitle)
        {
            string raceFilePath = GetRaceFileNameFromUrl(urlTitle);
            if (raceFilePath != null)
            {
                var raceViewModel = GetViewModelFromRaceFile(raceFilePath);
                raceViewModel.Text = GetTextFromRaceFile(raceFilePath);
                return raceViewModel;
            }
            return null;
        }

        private List<string> GetRaceFileNames()
        {
            string path = RacesFolderFilePath;
            var di = new DirectoryInfo(path);
            return di.GetFiles().Select(x => x.Name).ToList();
        }

        private RaceViewModel GetViewModelFromRaceFile(string raceFilePath)
        {
            var raceViewModel = new RaceViewModel();
            string[] array = raceFilePath.Split('-');
            int year = int.Parse(array[0].Substring(0, 4));
            int month = int.Parse(array[0].Substring(4, 2));
            int day = int.Parse(array[0].Substring(6, 2));
            raceViewModel.DateTime = new DateTime(year, month, day);
            raceViewModel.Distance = array[1];
            raceViewModel.Title = array[2].Replace("_", " ");
            raceViewModel.PageTitle = $"{raceViewModel.Title} - {raceViewModel.DateTimeDisplay}";

            raceViewModel.Url = "/race-results/" + raceFilePath;
            raceViewModel.City = array[3].Replace("_", " ");
            string state = array[4];
            if (state.Contains("."))
            {
                state = state.Substring(0, state.IndexOf('.'));
            }
            raceViewModel.State = state;
            return raceViewModel;
        }

        private string GetRaceFileNameFromUrl(string raceFileName)
        {
            var raceFilePath = string.Format($"{RacesFolderFilePath}\\{raceFileName}");
            if (File.Exists(raceFilePath))
                return raceFileName;
            else
                return null;
        }

        private string GetTextFromRaceFile(string fileName)
        {
            string text;
            using (var sr = new StreamReader(RacesFolderFilePath + "\\" + fileName))
            {
                text = sr.ReadToEnd();
            }
            return text;
        }

    }
}