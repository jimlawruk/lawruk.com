using System;
using System.Collections.Generic;
using System.Collections.ObjectModel;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.Configuration;
using Microsoft.VisualStudio.TestTools.UnitTesting;
using System.Net.Mail;
using System.Net;
using System.Collections;
using OpenQA.Selenium;
using OpenQA.Selenium.Firefox;
using OpenQA.Selenium.Support.UI;
using OpenQA.Selenium.IE;
using OpenQA.Selenium.Chrome;

using OpenQA.Selenium.Remote;

namespace SeleniumTests
{
    [TestClass]
    public abstract class BaseTest
    {
        protected static IWebDriver driver;
        protected static IWebDriver ieDriver;
        protected static IWebDriver firefoxDriver;
        protected static IWebDriver chromeDriver;
        protected static string baseURL;
        protected static string externalDriverPath;
        protected static string ErrorMessageTitle { get; set; }                
        protected static List<string> ErrorBrowsers { get; set; }
        protected static List<string> ErrorMessages { get; set; }
        protected static List<string> ErrorUrls { get; set; }

        [AssemblyInitializeAttribute]
        public static void Initialize(TestContext context)
        {
            BaseTest.Initialize();
        } 
        
        public static void Initialize()
        {
            SetBaseUrl();
            SetExternalDriverServerPath();
            SetupBrowsers();
            SetTimeoutForBrowsers();
        }

        private static void SetBaseUrl()
        {
            baseURL = ConfigurationManager.AppSettings["BaseUrl"];
            if (string.IsNullOrEmpty(baseURL))
            {
                baseURL = "http://www.lawruk.com";
            }
        }

        public string CurrentUrl
        {
            get
            {
                return driver.Url.Replace(baseURL,"");
            }
        }

        private static void SetExternalDriverServerPath()
        {
            //Hack: TODO fix. Cound not get the appsettings to work, so the possible paths are her for now.
            //string ieDriverServerPath = ConfigurationManager.AppSettings["IEDriverServerPath"];
            string[] paths = {@"C:\Users\Jim\Documents\lawruk.com\SeleniumTests"};
            foreach (var path in paths)
            {
                if (System.IO.File.Exists(path + "\\IEDriverServer.exe"))
                {
                    externalDriverPath = path;
                    break;
                }
            }
            if (string.IsNullOrEmpty(externalDriverPath))
            {
                externalDriverPath = AppDomain.CurrentDomain.BaseDirectory;
            }
        }       

        private static void SetupBrowsers()
        {
            firefoxDriver = new FirefoxDriver();
            chromeDriver = new OpenQA.Selenium.Chrome.ChromeDriver(externalDriverPath);

            var options = new InternetExplorerOptions();
            options.IntroduceInstabilityByIgnoringProtectedModeSettings = true;
            ieDriver = new OpenQA.Selenium.IE.InternetExplorerDriver(externalDriverPath, options);
            driver = firefoxDriver;//default;            
        }

        private static void SetTimeoutForBrowsers()
        {
            SetTimeout(ieDriver);
            SetTimeout(firefoxDriver);
            SetTimeout(chromeDriver);
        }

        private static void SetTimeout(IWebDriver driver)
        {
            driver.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromSeconds(10));
        }

        public void TestChromeOnly(Action method)
        {
            ErrorMessages = new List<string>();
            ErrorBrowsers = new List<string>();
            ErrorUrls = new List<string>();
            TestBrowser(chromeDriver, method);
            Assert.IsTrue(ErrorMessages.Count == 0, GetErrorMessage());
        }

        public void TestDifferentBrowsers(Action method)
        {
            ErrorMessages = new List<string>();
            ErrorBrowsers = new List<string>();
            ErrorUrls = new List<string>();
            TestBrowser(ieDriver, method);
            TestBrowser(chromeDriver, method);            
            TestBrowser(firefoxDriver, method);               
            Assert.IsTrue(ErrorMessages.Count == 0, GetErrorMessage());
        }       

        private string GetErrorMessage()
        {
            string finalErrorMessage = "";
            if (ErrorMessages.Count > 0)
            {
                //Show browsers first, error messages 2nd, urls 3rd
                finalErrorMessage += "Browsers: " + string.Join(", ",ErrorBrowsers);
                finalErrorMessage += " Errors: " + string.Join(", ", ErrorMessages);
                
                //Add baseUrl back to urls
                var errorUrls = new List<string>();
                foreach (var url in ErrorUrls)
                {
                    string newUrl = url;
                    if (url.Length > 0 && url.Substring(0,1) == "/")
                    {
                        newUrl = baseURL + url;
                    }
                    errorUrls.Add(newUrl);
                }
                finalErrorMessage += " Urls: " + string.Join(", ", errorUrls);                
            }
            return finalErrorMessage;
        }

        private void TestBrowser(IWebDriver d, Action method)
        {
            try
            {
                driver = d;
                method.DynamicInvoke();
            }
            catch (Exception ex)
            {                
                string errorMessage = ex.InnerException.Message.Split('\n')[0];
                AddErrorMessageToDictionary(errorMessage);
            }
        }

        private void AddErrorMessageToDictionary(string errorMessage)
        {
            var browserName = GetBrowserName();
            if (!ErrorBrowsers.Contains(browserName))
            {
                ErrorBrowsers.Add(browserName);
            }
            if (!ErrorUrls.Contains(CurrentUrl))
            {
                ErrorUrls.Add(CurrentUrl);
            }
            if (!ErrorMessages.Contains(errorMessage))
            {
                ErrorMessages.Add(errorMessage);
            }            
        }

        protected string GetBrowserName()
        {
            return driver.GetType().Name.Replace("Driver", "");
        }

        [AssemblyCleanup]
        public static void Cleanup()
        {
            firefoxDriver.Quit();
            ieDriver.Quit();
            chromeDriver.Quit();
        }

        protected void GoToUrl(string url)
        {
            GoToUrlInternal(url, baseURL);
        }

        protected void GoToIphoneUrl(string url)
        {
            url = url + "?iphone";
            GoToUrlInternal(url, "http://origin.heritage.org");
        }

        private void GoToUrlInternal(string url, string baseUrl)
        {
            url = url.Replace(baseUrl, "");//in case it already has the base Url          
            if (!url.Contains("http"))
            {
                url = baseUrl + url;
            }
            driver.Navigate().GoToUrl(url);
        }

        protected IWebElement FindElementTryCatch(By by)
        {
            try
            {
                int trys = 0;
                int maxTrys = 200;
                IWebElement element = null;
                while (trys < maxTrys)
                {
                    element = driver.FindElement(by);
                    if (element != null)
                    {
                        return element;
                    }
                    else
                    {
                        Sleep(200);
                        trys++;
                    }
                }
                
            }
            catch
            {
                return null;
            }
            return null;
        }

        protected ReadOnlyCollection<IWebElement> FindElementsTryCatch(By by)
        {
            try
            {
                int trys = 0;
                int maxTrys = 200;
                ReadOnlyCollection<IWebElement> elements = null;
                while (trys < maxTrys)
                {
                    elements = driver.FindElements(by);
                    if (elements != null)
                    {
                        return elements;
                    }
                    else
                    {
                        Sleep(200);
                        trys++;
                    }
                }

            }
            catch
            {
                return null;
            }
            return null;
        }

        protected IWebElement GetById(string id)
        {
            
            return FindElementTryCatch(By.Id(id));            
        }        

        protected IWebElement GetByCSS(string selector)
        {
            return FindElementTryCatch(By.CssSelector(selector));            
        }

        protected IWebElement GetByLinkText(string text)
        {
            return FindElementTryCatch(By.PartialLinkText(text));
        }


        protected IWebElement GetByPartialLinkText(string text)
        {
            return FindElementTryCatch(By.PartialLinkText(text));
        }

        protected ReadOnlyCollection<IWebElement> GetElementsByXPath(string xpath)
        {            
            return FindElementsTryCatch(By.XPath(xpath));
        }

        protected ReadOnlyCollection<IWebElement> GetElementsByCSS(string selector)
        {               
            return FindElementsTryCatch(By.CssSelector(selector));
        }

        protected string GetText(string selector)
        {
            return GetByCSS(selector).Text;
        }

        protected void SetSelectValue(string selector, string value)
        {
            SetSelectValueInternal(GetByCSS(selector), value);            
        }

        protected void SetSelectValueById(string id, string value)
        {
            SetSelectValueInternal(GetById(id), value);            
        }

        private void SetSelectValueInternal(IWebElement element, string value)
        {
            SelectElement selectElement = new SelectElement(element);
            selectElement.SelectByValue(value);
        }

        public void AssertText(string selector, string text)
        {
            var value = GetText(selector);
            AssertIsTrue(value == text, "Text " + text + " is not equal to " + value + " for " + selector);
        }

        public void AssertTextContains(string selector, string text)
        {
            AssertIsTrue(GetText(selector).Contains(text), "Text " + text + " is not present in CSS " + selector);
        }

        public void AssertTextIsPresent(string selector, string whatAreWeLookingFor)
        {
            AssertIsTrue(!string.IsNullOrEmpty(GetText(selector)), whatAreWeLookingFor + " is not populated");
        }

        public void AssertIsVisible(string selector, string whatAreWeLookingFor)
        {
            var element = GetByCSS(selector);
            AssertIsVisible(element, whatAreWeLookingFor);
        }

        public void AssertIsVisible(IWebElement element, string whatAreWeLookingFor)
        {
            AssertIsTrue(CheckForDelayedDisplayed(element, true), whatAreWeLookingFor + " is not visible");
        }

        public void AssertIsHidden(string selector, string whatAreWeLookingFor)
        {
            var element = GetByCSS(selector);
            AssertIsTrue(CheckForDelayedDisplayed(element, false), whatAreWeLookingFor + " is not hidden");
        }

        private bool CheckForDelayedDisplayed(IWebElement element, bool displayed)
        {
            int trys = 0;
            int maxTrys = 5;
            bool whatWeHope = false;
            if (element != null)
            {
                whatWeHope = element.Displayed == displayed;
            }
            else
            {
                whatWeHope = false;
            }
            while (trys < maxTrys && (element == null || (!element.Displayed == displayed)))
            {                
                trys++;
                Sleep(1000);
            }
            return whatWeHope;
        }

        public void AssertVisibleAndPopulated(string selector, string whatAreWeLookingFor)
        {
            AssertIsVisible(selector, whatAreWeLookingFor);
            AssertTextIsPresent(selector, whatAreWeLookingFor);
        }

        public void AssertAtLeastOneElementPopulatedByCSS(string selector, string errorMessage)
        {
            var list = GetElementsByCSS(selector);
            AssertIsTrue(list.Count > 0 && !string.IsNullOrEmpty(list[0].Text), errorMessage);
        }

        public void AssertCurrentUrl(string url)
        {
            int trys = 0;
            int maxTrys = 20;
            bool matches = false;
            while (!matches && trys < maxTrys)
            {                
                matches = CurrentUrl.IndexOf(url) == 0;
                if (!matches && !url.Contains("http://www.heritage.org"))//hack for urls that do not go to dev/stage
                {
                    matches = CurrentUrl.Replace("http://www.heritage.org", "").IndexOf(url) == 0;
                }
                trys++;
                Sleep(1000);
            }
            AssertIsTrue(matches, string.Format("Current Url {0} does not match expected {1}", CurrentUrl, url));
        }


        public List<string> GetListOfUrlsFromCSS(string selector)
        {
            List<string> urls = new List<string>();
            var items = GetElementsByCSS(selector);
            foreach (var a in items)
            {
                urls.Add(a.GetAttribute("href"));
            }
            return urls;
        }

        public void AssertAtLeastOneElementPopulatedByXPath(string xpath, string errorMessage)
        {
            var list = GetElementsByXPath(xpath);
            AssertIsTrue(list.Count > 0 && !string.IsNullOrEmpty(list[0].Text), errorMessage);
        }

        public void AssertUrlContains(string url)
        {
            url = url.Replace(baseURL, "");
            AssertCurrentUrl(url);                
        }

        public void Wait(int seconds)
        {
            var w = new WebDriverWait(driver, TimeSpan.FromSeconds(seconds));
        }

        public void AssertIsTrue(bool expression, string errorMessage)
        {
            var message = "";
            if (!string.IsNullOrEmpty(ErrorMessageTitle))
                message += ErrorMessageTitle + " ";
            
            message += errorMessage;
            if (!expression)
                SendError(message);
        }

        private void SendError(string message)
        {
            AddErrorMessageToDictionary(message);            
        }        

        private void EmailError(string message)
        {
            try
            {
                //TODO put in config file.
                //var server = "relayout.edgewebhosting.net";
                var server = "172.16.1.34";
                var from = "jim.lawruk@heritage.org";
                var to = "jim.lawruk@heritage.org";
                var sc = new SmtpClient(server);

                var mailMessage = new MailMessage(from, to);
                mailMessage.Body = message;
                sc.Timeout = 5000;// Wait no longer than five seconds for the server
                sc.Send(mailMessage);
            }
            finally { }
        }

        private void WriteToFile(string message)
        {
            var output = new System.IO.StreamWriter("test.txt",true);
            output.WriteLine(message);
            output.Close();
        }

        protected void Sleep(int milliseconds)
        {
            System.Threading.Thread.Sleep(milliseconds);
        }
    }
}
