import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import Map from '@arcgis/core/Map.js';
import MapView from '@arcgis/core/views/MapView.js';
import BasemapToggle from '@arcgis/core/widgets/BasemapToggle.js';
import Legend from '@arcgis/core/widgets/Legend.js';
import Locate from '@arcgis/core/widgets/Locate.js';
import Graphic from '@arcgis/core/Graphic.js';
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import FeatureLayer from '@arcgis/core/layers/FeatureLayer.js';
import Point from '@arcgis/core/geometry/Point.js';
import Polyline from '@arcgis/core/geometry/Polyline.js';
import SpatialReference from '@arcgis/core/geometry/SpatialReference.js';

const mileMarkers: [number, number, number][] = [
  [42.23626191262371, -71.50627202510685, 1],
  [42.24068539216792, -71.48754851853018, 2],
  [42.250906680613696, -71.47219151128903, 3],
  [42.258127, -71.456966, 4],
  [42.26973747414591, -71.44469118833605, 5],
  [42.27328718606571, -71.42690948367147, 6],
  [42.27841342303497, -71.40922031521815, 7],
  [42.28187235544563, -71.39129645347451, 8],
  [42.2838091159092, -71.36780030250607, 9],
  [42.283760323873864, -71.34761875418138, 10],
  [42.287891452612385, -71.33305583927591, 11],
  [42.29439, -71.318865, 12],
  [42.295977, -71.302814, 13],
  [42.302666, -71.28599, 14],
  [42.311471, -71.275248, 15],
  [42.323513, -71.262313, 16],
  [42.331841, -71.247112, 17],
  [42.339324, -71.236382, 18],
  [42.33714, -71.21742, 19],
  [42.337851, -71.198494, 20],
  [42.336277, -71.180072, 21],
  [42.34007490450584, -71.16403135373514, 22],
  [42.33682509623725, -71.14594087569148, 23],
  [42.34141286097229, -71.12364635435664, 24],
  [42.34539763993352, -71.10906586615123, 25],
  [42.348981742762206, -71.08975396124349, 26]
];

const hills: number[][][] = [
  [
    [42.33614754609016, -71.19261047959259],
    [42.33621099264794, -71.19137398123712],
    [42.3361971137189, -71.1899604570867],
    [42.33632797207099, -71.1871307265769],
    [42.33651632831192, -71.18562064290195],
    [42.33662537640409, -71.18453166604222],
    [42.336510380228724, -71.18242881417518],
    [42.336113840080195, -71.17906264186252],
    [42.336117805494055, -71.17863348842026]
  ]
];

const landmarks: [number, number, string][] = [
  [42.34062175509552, -71.23860881147961, 'Firehouse'],
  [42.34915968999376, -71.0964546275122, 'Citgo Sign'],
  [42.336120779553106, -71.17863482952106, 'Top of Heartbreak'],
  [42.358822895613926, -71.05694108486482, 'Boston Massacre'],
  [42.36632673826361, -71.05447249944879, 'Old North Church']
];

@Component({
  selector: 'app-boston-marathon',
  standalone: false,
  templateUrl: './boston-marathon.component.html',
  styleUrls: ['./boston-marathon.component.css']
})
export class BostonMarathonComponent implements AfterViewInit, OnDestroy {
  @ViewChild('viewDiv', { static: true }) viewDivEl!: ElementRef<HTMLDivElement>;

  private view: MapView | null = null;

  constructor(private titleService: Title) {
    this.titleService.setTitle('Boston Marathon Course Map | Lawruk.com');
  }

  ngAfterViewInit(): void {
    const map = new Map({ basemap: 'topo-vector' });

    this.view = new MapView({
      container: this.viewDivEl.nativeElement,
      map: map,
      zoom: 11,
      center: [-71.07, 42.29]
    });

    this.view.ui.add(new BasemapToggle({ view: this.view } as any), 'bottom-right');
    this.view.ui.add(new Locate({ view: this.view }), 'top-left');

    const marathonLayer = new FeatureLayer({
      url: 'https://services5.arcgis.com/wBdB5z26dRdLbBYy/arcgis/rest/services/Boston_Marathon/FeatureServer/0',
      title: 'Boston Marathon'
    });
    marathonLayer.renderer = {
      type: 'simple',
      symbol: { type: 'simple-line', width: 4, color: [0, 0, 200, 0.4] }
    } as any;
    map.add(marathonLayer);

    this.view.on('click', (e: any) => {
      console.log(e.mapPoint.latitude + ' ' + e.mapPoint.longitude);
    });

    this.addHillLayer(map);
    this.addPointLayer(map, [0, 200, 0], landmarks);

    const textLandmarksLayer = new GraphicsLayer({});
    this.updateTextSymbols(textLandmarksLayer, landmarks);
    map.add(textLandmarksLayer);

    this.addPointLayer(map, [200, 0, 0], mileMarkers);
    const textMileMarkersLayer = new GraphicsLayer({});
    this.updateTextSymbols(textMileMarkersLayer, mileMarkers);
    map.add(textMileMarkersLayer);

    this.view.ui.add(new Legend({ view: this.view }), 'bottom-left');
    this.view.watch('scale', () => {
      this.updateTextSymbols(textMileMarkersLayer, mileMarkers);
      this.updateTextSymbols(textLandmarksLayer, landmarks);
    });
  }

  ngOnDestroy(): void {
    this.view?.destroy();
  }

  private addPointLayer(map: Map, colorArray: number[], pointsArray: [number, number, number | string][]): void {
    const graphics = pointsArray.map(pt =>
      new Graphic({
        geometry: new Point({
          longitude: pt[1],
          latitude: pt[0],
          spatialReference: new SpatialReference({ wkid: 4326 })
        }),
        symbol: { type: 'simple-marker', color: colorArray, size: 8, outline: { color: colorArray, width: 2 } } as any
      })
    );
    const layer = new GraphicsLayer({});
    graphics.forEach(g => layer.add(g));
    map.add(layer);
  }

  private addHillLayer(map: Map): void {
    const hillsLayer = new GraphicsLayer({});
    const paths = hills.map(hill => hill.map(p => [p[1], p[0]]));
    const line = new Polyline({
      hasZ: false,
      hasM: true,
      paths: paths,
      spatialReference: { wkid: 4326 } as any
    });
    hillsLayer.add(new Graphic({
      geometry: line,
      symbol: { type: 'simple-line', color: [200, 0, 0, 0.6], width: 4, style: 'solid' } as any
    }));
    map.add(hillsLayer);
  }

  private updateTextSymbols(textLayer: GraphicsLayer, pointsArray: [number, number, number | string][]): void {
    if (!this.view) return;
    const scale = this.view.scale;
    const offset = Math.sqrt(scale) / 400000;
    textLayer.removeAll();
    if (scale > 36112) return;
    pointsArray.forEach(pt => {
      const textPoint = new Point({
        longitude: pt[1],
        latitude: pt[0] + offset,
        spatialReference: new SpatialReference({ wkid: 4326 })
      });
      textLayer.add(new Graphic({
        geometry: textPoint,
        symbol: {
          type: 'text', angle: 0, color: [50, 50, 50, 0.8], text: String(pt[2]),
          font: { family: 'Arial', size: 14 },
          horizontalAlignment: 'center', verticalAlignment: 'middle'
        } as any
      }));
    });
  }
}
