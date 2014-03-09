using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using lawrukmvc.Models;

namespace lawrukmvc.ViewModels
{
    public class MetroViewModel
    {
        public MetroStation CurrentMetroStation { get; set; }
        public List<MetroStation> SameLineStations { get; set; }         
    }
}