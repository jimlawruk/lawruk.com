using System;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Web.Mvc;
using lawrukmvc.ViewModels;
using lawrukmvc.Controllers;

namespace lawruk.Tests
{
    [TestClass]
    public class HomeControllerTest
    {
        [TestMethod]
        public void IndexViewModalHasButtons()
        {
            var homeController = new HomeController();
            ViewResult viewResult = (ViewResult) homeController.Index();
            HomeViewModel viewModel = (HomeViewModel)viewResult.Model;
            Assert.IsTrue(viewModel.HomeButtons.Count > 5);
        }
    }
}
