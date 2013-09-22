using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.Globalization;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Web.Security;
using System.IO;
using System.Web.Configuration;

namespace lawrukmvc.Models
{
    public class RaceFile
    {
        public string Filename { get; private set; }
        public string Title { get; set; }
        public DateTime Date { get; set; }
        public string Distance { get; set; }
        public string City { get; set; }
        public string State { get; set; }
       
        public RaceFile(string filename)
        {
            Filename = filename;
        }

        public string GetText()
        {
            string text;
            using (var sr = new StreamReader(WebConfigurationManager.AppSettings["RootDirectory"] + "\\Races\\" + Filename))
            {
                text = sr.ReadToEnd();
            }
            return text;
        }
    }
}
