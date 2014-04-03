using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using lawrukmvc.Helpers;
using lawrukmvc.Services;
using lawrukmvc.Models;
using lawrukmvc.ViewModels;


namespace lawrukmvc.Controllers
{
    public class MetroController : Controller
    {
        IMetroService metroService;

        public MetroController(IMetroService metroService)
        {
            this.metroService = metroService;
        }        

        public ActionResult Index(string tag)
        {
            if (tag != "")
            {
                return View("Metro", metroService.GetMetroStationViewModel(tag));
            }
            else
            {
                return View(metroService.GetMetroStations());
            }            
        }      

    }
}
