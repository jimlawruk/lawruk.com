using System;
namespace lawrukmvc.Helpers
{
    public interface IMetroService
    {
        lawrukmvc.ViewModels.MetroStationsViewModel GetMetroStations();
        lawrukmvc.ViewModels.MetroViewModel GetMetroStationViewModel(string tag);
    }
}
