using System;
namespace lawrukmvc.Services
{
    public interface IMetroService
    {
        lawrukmvc.ViewModels.MetroStationsViewModel GetMetroStations();
        lawrukmvc.ViewModels.MetroViewModel GetMetroStationViewModel(string tag);
    }
}
