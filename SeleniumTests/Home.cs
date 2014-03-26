using System;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;
using OpenQA.Selenium.Firefox;

namespace SeleniumTests
{
    [TestClass]
    public class Home : BaseTest
    {       

        [TestMethod]
        public void AboutTextPresent()
        {
            TestDifferentBrowsers((Action)delegate
            {
                AssertText(".home-link", "About");
            });
        }

        [TestMethod]
        public void AboutLink()
        {
            TestChromeOnly((Action)delegate
            {
                GetAboutLink().Click();
                AssertCurrentUrl("/about");
            });
        }

        private IWebElement GetAboutLink()
        {
            GoToUrl("/");
            return GetByCSS(".home-link");
        }

    }
}
