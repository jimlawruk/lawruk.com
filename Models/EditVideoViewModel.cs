using System;
using System.Collections.Generic;
using System.Linq;
using System.ComponentModel.DataAnnotations;
using System.Web;
using System.Web.Mvc;

namespace lawrukmvc.Models
{
    public class EditVideoViewModel
    {
        [Required]
        public string Title { get; set; }



    }
}