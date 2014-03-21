using System;
using System.Collections.Generic;
using lawrukmvc.Models;
namespace lawrukmvc.Helpers
{
    public interface INewsService
    {
        List<TagTitleUrl> GetNewsSources();
        TagTitleUrl GetNewsFeedUrl(string tag);
    }
}
