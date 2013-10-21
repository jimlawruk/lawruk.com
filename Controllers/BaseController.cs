using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Data;
using System.Data.Objects.DataClasses;
using System.ServiceModel;

namespace lawrukmvc.Controllers
{
    public abstract class BaseController : Controller
    {        
        protected lawrukmvc.Models.LawrukRepository lawrukRepository = new Models.LawrukRepository();
        protected virtual string ListView { get; set; }

        public BaseController()
        {
            ListView = "Index";           
        }

        public ActionResult Detail(int id, string extension)
        {
            var result = GetDetailModel(id);
            if (extension == "json")
                return Json(result, JsonRequestBehavior.AllowGet);
            else
                return View(result);
        }
        
        public ActionResult Index(string extension)
        {
            var result = GetListModel(false);
            if (extension == "json")
                return Json(result, JsonRequestBehavior.AllowGet);
            else
                return View(ListView, GetListModel(false));
        }

        public ActionResult Tagged(string tag)
        {
            return View(GetTaggedList(tag));
        }

        [Authorize]
        public virtual ActionResult Edit(string tag)
        {
            if (string.IsNullOrEmpty(tag))
                return View(ListView, GetListModel(true));

            object item;
            int id = int.Parse(tag);
            if (id > 0)
            {
                item = GetItem(id);
            }
            else
            {
                item = NewItem();
            }
            return View(item);
        }

        [Authorize]
        [HttpPost]
        [ValidateInput(false)]
        [ActionName("Edit")]
        //[ValidateAntiForgeryToken(Salt="mysalt")]
        public ActionResult EditPost(string tag)
        {
            int id = int.Parse(tag);
            EntityObject item;
            if (id == 0)
            {
                item = NewItem();
            }
            else
            {
                item= GetItem(id);
            }            
            item = PopulateItem(item);

            if (item.EntityState == System.Data.EntityState.Added || item.EntityState == System.Data.EntityState.Detached)
            {
                lawrukRepository.LawrukEntities.AddObject(item.GetType().Name + "s", item);
            }
            lawrukRepository.LawrukEntities.SaveChanges();
            string redirectStr = "/" + item.GetType().Name + "s/edit";
            redirectStr = redirectStr.ToLower().Replace("blogposts", "blog");//TODO Hack
            redirectStr = redirectStr.ToLower().Replace("results", "s");
            return Redirect(redirectStr);
        }

        public abstract EntityObject NewItem();

        public abstract EntityObject GetItem(int id);

        public abstract object GetDetailModel(int id);

        public abstract EntityObject PopulateItem(EntityObject item);       

        public abstract object GetListModel(bool editMode);

        public virtual object GetTaggedList(string tag)
        {
            return View();
        }

        protected override void HandleUnknownAction(string actionName)
        {
            // If controller is ErrorController dont 'nest' exceptions
            //if (this.GetType() != typeof(ErrorController))
            //InvokeHttp404(HttpContext);
        }

        //public ActionResult InvokeHttp404(HttpContextBase httpContext)
        //{
        //    //IController errorController = ObjectFactory.GetInstance<ErrorController>();
        //    //var errorRoute = new RouteData();
        //    //errorRoute.Values.Add("controller", "Error");
        //    //errorRoute.Values.Add("action", "Http404");
        //    //errorRoute.Values.Add("url", httpContext.Request.Url.OriginalString);
        //    //errorController.Execute(new RequestContext(
        //    //     httpContext, errorRoute));

        //    //return new EmptyResult();
        //}


    }
}
