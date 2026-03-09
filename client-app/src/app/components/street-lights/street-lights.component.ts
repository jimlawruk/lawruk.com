import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import Map from '@arcgis/core/Map.js';
import MapView from '@arcgis/core/views/MapView.js';
import BasemapToggle from '@arcgis/core/widgets/BasemapToggle.js';
import LayerList from '@arcgis/core/widgets/LayerList.js';
import Locate from '@arcgis/core/widgets/Locate.js';
import Graphic from '@arcgis/core/Graphic.js';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import Point from '@arcgis/core/geometry/Point.js';
import Polyline from '@arcgis/core/geometry/Polyline.js';
import SpatialReference from '@arcgis/core/geometry/SpatialReference.js';
import SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol.js';
import esriRequest from '@arcgis/core/request.js';

@Component({
  selector: 'app-street-lights',
  standalone: false,
  templateUrl: './street-lights.component.html',
  styleUrls: ['./street-lights.component.css']
})
export class StreetLightsComponent implements AfterViewInit, OnDestroy {
  @ViewChild('viewDiv', { static: true }) viewDivEl!: ElementRef<HTMLDivElement>;

  private view: MapView | null = null;

  constructor(private titleService: Title) {
    this.titleService.setTitle('Camp Hill Street Lights | Lawruk.com');
  }

  ngAfterViewInit(): void {
    const map = new Map({ basemap: 'streets-night-vector' });

    this.view = new MapView({
      container: this.viewDivEl.nativeElement,
      map: map,
      zoom: 14,
      center: [-76.925, 40.245]
    });

    this.view.ui.add(new BasemapToggle({ view: this.view } as any), 'bottom-right');
    this.view.ui.add(new LayerList({ view: this.view }), 'top-right');
    this.view.ui.add(new Locate({ view: this.view }), 'top-left');

    this.view.when(() => {
      this.addGeoJSONLayer(map, '/blog/collecting-mapping-street-lights/lines.json', 'Route', [200, 0, 0, 1]);
      this.addGeoJSONLayer(map, '/blog/collecting-mapping-street-lights/points.json', 'Street Lights', [200, 200, 0, 1]);
    });
  }

  ngOnDestroy(): void {
    this.view?.destroy();
  }

  private addGeoJSONLayer(map: Map, fileName: string, title: string, colorArray: number[]): void {
    esriRequest(fileName, { responseType: 'json' } as any).then((response: any) => {
      const geoJson = response.data;
      const type = geoJson.features.length && geoJson.features[0].geometry.type;
      let graphics: Graphic[];
      if (type === 'LineString') {
        graphics = this.getLineGraphics(geoJson, 4326, colorArray);
      } else {
        graphics = this.getPointGraphics(geoJson, 4326, colorArray);
      }
      const graphicsLayer = new GraphicsLayer({ title: title } as any);
      graphics.forEach(g => graphicsLayer.add(g));
      map.add(graphicsLayer);
    });
  }

  private getPointGraphics(geoJson: any, wkid: number, colorArray: number[]): Graphic[] {
    return geoJson.features.map((feature: any) => {
      const coords = feature.geometry.coordinates;
      const point = new Point({
        longitude: coords[0],
        latitude: coords[1],
        spatialReference: new SpatialReference({ wkid: wkid })
      });
      const symbol = { type: 'simple-marker', color: colorArray, size: 8, outline: { color: [255, 255, 255], width: 2 } };
      return new Graphic(this.getGraphicDef(feature, point, symbol));
    });
  }

  private getLineGraphics(geoJson: any, wkid: number, colorArray: number[]): Graphic[] {
    return geoJson.features.map((feature: any) => {
      const paths = feature.geometry.coordinates || feature.geometry.paths;
      const polyline = new Polyline({
        paths: [paths],
        spatialReference: new SpatialReference({ wkid: wkid })
      });
      const symbol = new SimpleLineSymbol({ color: colorArray, width: 2, style: 'solid' } as any);
      return new Graphic(this.getGraphicDef(feature, polyline, symbol));
    });
  }

  private getGraphicDef(feature: any, geometry: any, symbol: any): any {
    const fieldInfos: any[] = [];
    for (const prop in feature.properties) {
      fieldInfos.push({ fieldName: prop });
    }
    return {
      geometry: geometry,
      symbol: symbol,
      attributes: feature.properties || feature.attributes,
      popupTemplate: { title: 'Segment', content: [{ type: 'fields', fieldInfos: fieldInfos }] }
    };
  }
}
