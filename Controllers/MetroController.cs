using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using lawrukmvc.Models;
using lawrukmvc.ViewModels;
using lawrukmvc.Helpers;

namespace lawrukmvc.Controllers
{
    public class MetroController : Controller
    {
        MetroService metroStationService = new MetroService();

        public ActionResult Index(string tag)
        {
            if (tag != "")
            {
                return View("Metro", metroStationService.GetMetroStationViewModel(tag));
            }
            else
            {
                return View(metroStationService.GetMetroStations());
            }            
        }      

    }
}
