using System;
using System.Text;
using System.Text.RegularExpressions;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using OpenQA.Selenium;
using OpenQA.Selenium.Firefox;

namespace SeleniumTests
{
    [TestClass]
    public class Metro : BaseTest
    {
        [TestMethod]
        public void TestBethesaMetroPageFromHomeContainsGlenmont()
        {
            TestChromeOnly((Action)delegate
            {
                GoToUrl("/");
                GetByLinkText("Metro").Click();
                GetByLinkText("Bethesda").Click();
                AssertTextContains("table", "Glenmont");
            });
        }
    }
}
