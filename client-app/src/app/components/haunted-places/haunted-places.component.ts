import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import type MapView from '@arcgis/core/views/MapView.js';
import { ArcGISLoaderService, ArcGISClasses } from '../../services/arcgis-loader.service';

@Component({
  selector: 'app-haunted-places',
  standalone: false,
  templateUrl: './haunted-places.component.html',
  styleUrls: ['./haunted-places.component.css']
})
export class HauntedPlacesComponent implements AfterViewInit, OnDestroy {
  @ViewChild('viewDiv', { static: true }) viewDivEl!: ElementRef<HTMLDivElement>;

  private view: MapView | null = null;
  private esri!: ArcGISClasses;

  constructor(private titleService: Title, private arcgisLoader: ArcGISLoaderService) {
    this.titleService.setTitle('Haunted Places in America | Lawruk.com');
  }

  async ngAfterViewInit(): Promise<void> {
    this.esri = await this.arcgisLoader.load();
    const { Map, MapView, FeatureLayer, Legend, BasemapToggle, Locate } = this.esri;

    const map = new Map({ basemap: 'streets-night-vector' });

    this.view = new MapView({
      container: this.viewDivEl.nativeElement,
      map: map,
      zoom: 5,
      center: [-80.925, 38.245]
    });

    this.view.ui.add(new BasemapToggle({ view: this.view, nextBasemap: 'streets-navigation-vector' }), 'bottom-right');
    this.view.ui.add(new Locate({ view: this.view }), 'top-left');

    const hauntedPlacesLayer = new FeatureLayer({
      url: 'https://services.arcgis.com/0hWR1h1PHFoPztOo/arcgis/rest/services/Haunted_Places_in_America/FeatureServer/0',
      title: 'Haunted Places',
      popupTemplate: {
        title: '{title}',
        content: [{
          type: 'fields',
          fieldInfos: [
            { fieldName: 'location_type', label: 'Location Type' },
            { fieldName: 'ghost_type', label: 'Ghost Type' },
            { fieldName: 'city', label: 'City' },
            { fieldName: 'state', label: 'State' },
            { fieldName: 'description', label: 'Description' }
          ]
        }]
      } as any
    });

    hauntedPlacesLayer.renderer = {
      type: 'unique-value',
      field: 'location_type',
      defaultSymbol: { type: 'simple-marker', size: 8, color: [140, 190, 214] },
      uniqueValueInfos: [
        { value: 'cemetery', symbol: { type: 'simple-marker', size: 8, color: [128, 128, 128] } },
        { value: 'church', symbol: { type: 'simple-marker', size: 8, color: [65, 10, 128] } },
        { value: 'hospital', symbol: { type: 'simple-marker', size: 8, color: [0, 128, 255] } },
        { value: 'house', symbol: { type: 'simple-marker', size: 8, color: [200, 102, 0] } },
        { value: 'park', symbol: { type: 'simple-marker', size: 8, color: [0, 140, 10] } },
        { value: 'hotel', symbol: { type: 'simple-marker', size: 8, color: [200, 50, 0] } },
        { value: 'school', symbol: { type: 'simple-marker', size: 8, color: [140, 10, 250] } },
        { value: 'theatre', symbol: { type: 'simple-marker', size: 8, color: [240, 102, 178] } }
      ]
    } as any;

    this.view.ui.add(new Legend({ view: this.view } as any), 'bottom-left');

    hauntedPlacesLayer.when(() => {
      hauntedPlacesLayer.effect = 'bloom(1.5, 0.5px, 0.5)';
    });

    map.add(hauntedPlacesLayer);
  }

  ngOnDestroy(): void {
    this.view?.destroy();
  }
}
