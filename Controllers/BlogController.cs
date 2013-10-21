using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.IO;
using lawrukmvc.Models;
using lawrukmvc.Helpers;
using lawrukmvc.ViewModels;
using System.Data.Objects.DataClasses;

namespace lawrukmvc.Controllers
{
    public class BlogController : BaseController
    {
        public BlogController()
        {
            this.ListView = "ThumbnailListAndTitleUrlList";
        }

        public override EntityObject PopulateItem(EntityObject item)
        {
            BlogPost blogPost = item as BlogPost;
            blogPost.Body = Request.Params["body"];
            blogPost.Title = Request.Params["title"];
            blogPost.Visibility = int.Parse(Request.Params["visibility"]);
            blogPost.Date = DateTime.Parse(Request.Params["date"]);
            blogPost.FlickrImageUrl = Request.Params["flickrimageurl"];
            blogPost.LastModified = DateTime.Now;
            return blogPost;
        }

        public override object GetDetailModel(int id)
        {
            var blogPost = (BlogPost)GetItem(id);            
            var viewModel = new BlogPostViewModel(blogPost);
            viewModel.RelatedPosts = lawrukRepository.GetBlogPostViewModels();
            return viewModel;
        }        

        public override EntityObject NewItem()
        {
            return new BlogPost();
        }

        public override EntityObject GetItem(int id)
        {
            return lawrukRepository.LawrukEntities.BlogPosts.FirstOrDefault(i => i.Id == id);
        }

        public override object GetListModel(bool editMode)
        {
            var listViewModel = new ThumbnailListAndTitleUrlList();
            listViewModel.Title = "Blog Posts";

            var thumbnailList = new ThumbnailListViewModel();
            thumbnailList.EditMode = editMode;
            thumbnailList.Items = lawrukRepository.GetBlogPostViewModels();
            listViewModel.ThumbnailListViewModel = thumbnailList;

            var titleUrlList = new TitleUrlListViewModel();
            titleUrlList.Title = "";
            titleUrlList.TitleUrls = new List<ITitleUrl>();
            listViewModel.TitleUrlListViewModel = titleUrlList;
            return listViewModel;
            
        }
    }
}
