using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using System.Data.Objects.DataClasses;
using lawrukmvc.ViewModels;

namespace lawrukmvc.Controllers
{
    public class TagController : BaseController
    {


        public override EntityObject NewItem()
        {
            return new Tag();
        }

        public override EntityObject GetItem(int id)
        {
            return lawrukRepository.LawrukEntities.Tags.Where(t => t.Id == id).FirstOrDefault();
        }

        public override object GetDetailModel(int id)
        {
            var tag = (Tag)GetItem(id);
            var tagViewModel = new TagViewModel(tag);
            return tagViewModel;
        }

        public override EntityObject PopulateItem(EntityObject item)
        {
            Tag tag  = item as Tag;
            tag.Title = Request.Params["title"];
            return tag;
        }

        public override object GetListModel(bool editMode)
        {
            var tagsViewModel = new TagsViewModel();
            tagsViewModel.Edit = editMode;
            tagsViewModel.Tags = lawrukRepository.GetTagViewModels();
            return tagsViewModel;
        }
    }
}
