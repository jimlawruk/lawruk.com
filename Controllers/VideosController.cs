using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using lawrukmvc.Models;
using lawrukmvc.ViewModels;
using System.Data;
using System.Data.Objects.DataClasses;

namespace lawrukmvc.Controllers
{
    public class VideosController : BaseController
    {
        public VideosController()
        {
            this.ListView = "ThumbnailListAndTitleUrlList";
        }

        public override object GetListModel(bool editMode)
        {
            var listViewModel = new ThumbnailListAndTitleUrlList();
            listViewModel.Title = "Videos";

            var videos = lawrukRepository.GetVideoViewModels();
            var thumbnailList = new ThumbnailListViewModel();
            thumbnailList.Items = videos;
            thumbnailList.EditMode = editMode;
            listViewModel.ThumbnailListViewModel = thumbnailList;

            var titleUrlList = new TitleUrlListViewModel();
            titleUrlList.Title = "Video Tags";
            titleUrlList.TitleUrls = new List<ITitleUrl>();
            listViewModel.TitleUrlListViewModel = titleUrlList;
            return listViewModel;
        }

        public override object GetTaggedList(string tag)
        {
            return base.GetTaggedList(tag);
        }

        public override EntityObject NewItem()
        {
            return new Video();
        }

        public override EntityObject GetItem(int id)
        {
            return GetVideo(id);
        }

        private Video GetVideo(int id)
        {
            return lawrukRepository.LawrukEntities.Videos.FirstOrDefault(i => i.Id == id);
        }

        public override object GetDetailModel(int id)
        {
            var video = GetVideo(id);
            var viewModel = new VideoViewModel(video);            
            viewModel.RelatedVideos = new List<VideoViewModel>();
            return viewModel;
        }

        public override EntityObject PopulateItem(EntityObject item)        
        {
            Video video = item as Video;
            video.YouTubeId = Request.Params["youtubeid"];
            video.Visibility = int.Parse(Request.Params["visibility"]);
            video.Title = Request.Params["title"];
            video.Date = DateTime.Parse(Request.Params["date"]);
            var tags = Request.Params["tags"];
            lawrukRepository.SaveTags(video, tags);
            return video;
        }

        

        

    }
}
