import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import type Map from '@arcgis/core/Map.js';
import type MapView from '@arcgis/core/views/MapView.js';
import type GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import { Chart, registerables } from 'chart.js';
import { ArcGISLoaderService, ArcGISClasses } from '../../services/arcgis-loader.service';

declare var google: any;

Chart.register(...registerables);

const NAVY: number[] = [0, 0, 128];
const NAVY_ALPHA: number[] = [0, 0, 128, 0.8];
const DARK_YELLOW: number[] = [218, 165, 32];
const DARK_YELLOW_ALPHA: number[] = [218, 165, 32, 0.85];
const WHITE: number[] = [255, 255, 255];

const mileMarkers: [number, number, number | string][] = [
  [42.2297210, -71.5181970, 'Start'],
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
  [42.348981742762206, -71.08975396124349, 26],
  [42.34975908098082, -71.07861399650574, 'Finish']  
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
  [42.336120779553106, -71.17863482952106, 'Top of Heartbreak'],
  [42.358822895613926, -71.05694108486482, 'Boston Massacre'],
  [42.36632673826361, -71.05447249944879, 'Old North Church']
];

interface ElevationPoint {
  lat: number;
  lon: number;
  ele: number;
  distance: number;
}

@Component({
  selector: 'app-boston-marathon',
  standalone: false,
  templateUrl: './boston-marathon.component.html',
  styleUrls: ['./boston-marathon.component.css']
})
export class BostonMarathonComponent implements AfterViewInit, OnDestroy {
  @ViewChild('viewDiv', { static: true }) viewDivEl!: ElementRef<HTMLDivElement>;
  @ViewChild('elevationCanvas', { static: true }) elevationCanvasEl!: ElementRef<HTMLCanvasElement>;
  @ViewChild('streetViewPanel', { static: true }) streetViewPanelEl!: ElementRef<HTMLDivElement>;
  @ViewChild('streetViewInner', { static: true }) streetViewInnerEl!: ElementRef<HTMLDivElement>;

  private view: MapView | null = null;
  private elevationChart: Chart | null = null;
  private elevationData: ElevationPoint[] = [];
  private clickMarkerLayer: GraphicsLayer | null = null;
  private streetViewMarkerLayer: GraphicsLayer | null = null;
  private streetViewEnabled = true;
  private lastStreetViewPos: { lat: number; lon: number } | null = null;
  private esri!: ArcGISClasses;

  constructor(private titleService: Title, private http: HttpClient, private arcgisLoader: ArcGISLoaderService) {
    this.titleService.setTitle('Boston Marathon Course Map | Lawruk.com');
  }

  async ngAfterViewInit(): Promise<void> {
    this.esri = await this.arcgisLoader.load();
    const { Map, MapView, FeatureLayer, GraphicsLayer, Point, SpatialReference, BasemapToggle, LayerList, Locate, Expand } = this.esri;

    const map = new Map({ basemap: 'topo-vector' });

    this.view = new MapView({
      container: this.viewDivEl.nativeElement,
      map: map,
      zoom: 11,
      center: [-71.07, 42.29]
    });

    const basemapToggle = new BasemapToggle({ view: this.view, nextBasemap: 'streets-night-vector' });
    this.view.ui.add(basemapToggle, 'bottom-right');

    const locate = new Locate({ view: this.view });
    this.view.ui.add(locate, 'top-left');

     const layerList = new LayerList({ view: this.view });
     if (window.innerWidth <= 600) {
       const expand = new Expand({ view: this.view, content: layerList, expanded: false, expandTooltip: 'Layers' });
       this.view!.ui.add(expand, 'top-right');
     } else {
       this.view!.ui.add(layerList, 'top-right');
     }

    const municipalitiesLayer = new FeatureLayer({
      url: 'https://arcgisserver.digital.mass.gov/arcgisserver/rest/services/AGOL/SurveyTowns_WebMerc_doc/MapServer/0',
      title: 'Municipalities',
      definitionExpression: "TOWN IN ('HOPKINTON', 'FRAMINGHAM', 'ASHLAND', 'NATICK','WELLESLEY', 'NEWTON', 'BROOKLINE', 'BOSTON')",
      renderer: {
        type: 'simple',
        symbol: {
          type: 'simple-fill',
          color: [...DARK_YELLOW, 0.1],
          outline: { color: NAVY, width: 2 }
        }
      } as any,
      labelingInfo: [{
        labelExpressionInfo: { expression: '$feature.TOWN' },
        symbol: {
          type: 'text',
          color: NAVY,
          haloColor: WHITE,
          haloSize: 2,
          font: { family: 'Arial', size: 12, weight: 'bold' }
        }
      }] as any,
      labelsVisible: true
    });
    map.add(municipalitiesLayer);

    const marathonLayer = new FeatureLayer({
      url: 'https://services5.arcgis.com/wBdB5z26dRdLbBYy/arcgis/rest/services/Boston_Marathon/FeatureServer/0',
      title: 'Marathon Route'
    });
    marathonLayer.renderer = {
      type: 'simple',
      symbol: { type: 'simple-line', width: 8, color: NAVY_ALPHA }
    } as any;
    map.add(marathonLayer);

    this.clickMarkerLayer = new GraphicsLayer({ title: 'Click Marker', listMode: 'hide' });
    map.add(this.clickMarkerLayer);
    this.streetViewMarkerLayer = new GraphicsLayer({ title: 'Street View Arrow', listMode: 'hide' });
    map.add(this.streetViewMarkerLayer);

    this.view.on('click', (e: any) => {
      if (e.mapPoint) {
        this.onPolylineClick(e.mapPoint.latitude, e.mapPoint.longitude);
        if (this.streetViewEnabled) {
          this.lastStreetViewPos = { lat: e.mapPoint.latitude, lon: e.mapPoint.longitude };
          this.showStreetViewAt(e.mapPoint.latitude, e.mapPoint.longitude);
        }
      }
    });

    this.addHillLayer(map);
    const landmarksLayer = this.addPointLayer('Landmarks', map, [0, 200, 0], landmarks, true);
    landmarksLayer.add(this.getCitgoSignGraphic());  

    const textLandmarksLayer = new GraphicsLayer({ title: 'Landmark Labels', visible: false });
    this.updateTextSymbols(textLandmarksLayer, landmarks, false);
    map.add(textLandmarksLayer);

    this.addPointLayer('Mile Markers', map, DARK_YELLOW, mileMarkers, true);
    const textMileMarkersLayer = new GraphicsLayer({ title: 'Mile Marker Labels' });
    this.updateTextSymbols(textMileMarkersLayer, mileMarkers, true);
    map.add(textMileMarkersLayer);

    this.view.when(() => {
     

      // Street View toggle widget
      const toggleDiv = document.createElement('div');
      toggleDiv.style.cssText = 'background:white;padding:6px 10px;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,0.3);font-size:13px;display:flex;align-items:center;gap:6px;cursor:pointer;';
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = 'sv-toggle';
      checkbox.checked = true;
      checkbox.style.cursor = 'pointer';
      const label = document.createElement('label');
      label.htmlFor = 'sv-toggle';
      label.textContent = 'Street View';
      label.style.cursor = 'pointer';
      checkbox.addEventListener('change', () => this.onStreetViewToggle(checkbox.checked));
      toggleDiv.appendChild(checkbox);
      toggleDiv.appendChild(label);
      this.view!.ui.add(toggleDiv, 'top-right');
    });
    this.view.watch('scale', () => {
      this.updateTextSymbols(textMileMarkersLayer, mileMarkers, true);
      this.updateTextSymbols(textLandmarksLayer, landmarks, false);
    });

    this.loadGpxAndBuildChart();
  }

  ngOnDestroy(): void {
    this.elevationChart?.destroy();
    this.view?.destroy();
  }

  public onStreetViewToggle(enabled: boolean): void {
    this.streetViewEnabled = enabled;
    if (!enabled) {
      this.hideStreetView();
    } else if (this.lastStreetViewPos) {
      this.showStreetViewAt(this.lastStreetViewPos.lat, this.lastStreetViewPos.lon);
    }
  }

  private updateStreetViewArrow(lat: number, lon: number, heading: number): void {
    if (!this.streetViewMarkerLayer) return;
    const { Graphic, Point, SpatialReference } = this.esri;
    this.streetViewMarkerLayer.removeAll();
    // SVG arrow pointing up (north = 0°). Stem is narrow; wide arrowhead makes direction obvious.
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 40">
      <polygon points="10,0 20,18 13,18 13,40 7,40 7,18 0,18"
        fill="#FFDD00" stroke="#000080" stroke-width="1.5"/>
    </svg>`;
    this.streetViewMarkerLayer.add(new Graphic({
      geometry: new Point({ latitude: lat, longitude: lon, spatialReference: new SpatialReference({ wkid: 4326 }) }),
      symbol: {
        type: 'picture-marker',
        url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`,
        width: '20px',
        height: '40px',
        angle: heading
      } as any
    }));
  }

  private showStreetViewAt(lat: number, lon: number): void {
    if (typeof google === 'undefined') return;
    const service = new google.maps.StreetViewService();
    service.getPanorama({ location: { lat, lng: lon }, radius: 50 }, (data: any, status: any) => {
      if (status === 'OK') {
        this.streetViewPanelEl.nativeElement.style.display = 'block';
        const panorama = new google.maps.StreetViewPanorama(this.streetViewInnerEl.nativeElement, {
          position: { lat, lng: lon },
          pov: { heading: 34, pitch: 10 },
          zoom: 1
        });
        this.updateStreetViewArrow(lat, lon, 34);
        panorama.addListener('pov_changed', () => {
          const pov = panorama.getPov();
          const pos = panorama.getPosition();
          this.updateStreetViewArrow(pos ? pos.lat() : lat, pos ? pos.lng() : lon, pov.heading);
        });
      } else {
        this.streetViewPanelEl.nativeElement.style.display = 'none';
      }
    });
  }

  public hideStreetView(): void {
    this.streetViewPanelEl.nativeElement.style.display = 'none';
    this.streetViewMarkerLayer?.removeAll();
  }

  private loadGpxAndBuildChart(): void {
    // Fetch pre-processed compact JSON instead of the raw 113k-line GPX
    this.http.get<[number, number, number, number][]>('boston-marathon-elevation.json').subscribe(data => {
      this.elevationData = data.map(p => ({ lat: p[0], lon: p[1], ele: p[2], distance: p[3] }));
      this.buildElevationChart();
    });
  }

  private buildElevationChart(): void {
    const canvas = this.elevationCanvasEl.nativeElement;
    const ctx = canvas.getContext('2d')!;
    const dataPoints = this.elevationData.map(p => ({ x: p.distance, y: p.ele }));
    const elevations = dataPoints.map(p => p.y);
    const minEle = Math.floor(Math.min(...elevations) / 10) * 10;
    const maxEle = Math.ceil(Math.max(...elevations) / 10) * 10;
    const maxDist = Math.round(this.elevationData[this.elevationData.length - 1].distance * 10) / 10;

    this.elevationChart = new Chart(ctx, {
      type: 'line',
      data: {
        datasets: [
          {
            label: 'Elevation (ft)',
            data: dataPoints,
            borderColor: 'grey',
            backgroundColor: 'rgba(200, 200, 200, 0.5)',
            fill: true,
            pointRadius: 0,
            tension: 0.3,
          },
          {
            label: 'Position',
            data: [],
            borderColor: 'red',
            backgroundColor: 'red',
            pointRadius: 6,
            showLine: false,
          }
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { display: false } },
        scales: {
          x: {
            type: 'linear',
            title: { display: true, text: 'Miles' },
            ticks: { maxTicksLimit: 14 },
            min: 0,
            max: maxDist,
          },
          y: {
            title: { display: true, text: 'Elevation (ft)' },
            min: minEle,
            max: maxEle,
            ticks: { padding: 5, autoSkip: true, maxTicksLimit: 6 },
          },
        },
        onClick: (_event, elements, chart) => {
          const xScale = chart.scales['x'];
          const canvasPosition = (chart as any).canvas.getBoundingClientRect();
          const nativeEvent = (_event as any).native;
          if (!nativeEvent) return;
          const clickX = nativeEvent.clientX - canvasPosition.left;
          const distance = xScale.getValueForPixel(clickX);
          if (distance !== undefined) {
            this.onChartClick(distance);
          }
        }
      },
    });
  }

  private onPolylineClick(lat: number, lon: number): void {
    if (!this.elevationData.length || !this.elevationChart) return;

    // Find closest elevation data point
    let closestIdx = 0;
    let minDist = Infinity;
    for (let i = 0; i < this.elevationData.length; i++) {
      const d = (this.elevationData[i].lat - lat) ** 2 + (this.elevationData[i].lon - lon) ** 2;
      if (d < minDist) { minDist = d; closestIdx = i; }
    }
    if (minDist > 0.01) return; // ignore clicks more than ~0.1 degrees from the route

    const pt = this.elevationData[closestIdx];
    this.elevationChart.data.datasets[1].data = [{ x: pt.distance, y: pt.ele }];
    this.elevationChart.update('none');

    // Show marker on map
    this.showClickMarker(lat, lon);
  }

  private onChartClick(distance: number): void {
    if (!this.elevationData.length) return;

    // Find closest point by distance
    let closestIdx = 0;
    let minDiff = Infinity;
    for (let i = 0; i < this.elevationData.length; i++) {
      const diff = Math.abs(this.elevationData[i].distance - distance);
      if (diff < minDiff) { minDiff = diff; closestIdx = i; }
    }

    const pt = this.elevationData[closestIdx];

    // Update chart marker
    if (this.elevationChart) {
      this.elevationChart.data.datasets[1].data = [{ x: pt.distance, y: pt.ele }];
      this.elevationChart.update('none');
    }

    // Show marker on map and center
    this.showClickMarker(pt.lat, pt.lon);
  }

  private showClickMarker(lat: number, lon: number): void {
    if (!this.clickMarkerLayer) return;
    const { Graphic, Point, SpatialReference } = this.esri;
    this.clickMarkerLayer.removeAll();
    this.clickMarkerLayer.add(new Graphic({
      geometry: new Point({
        latitude: lat,
        longitude: lon,
        spatialReference: new SpatialReference({ wkid: 4326 })
      }),
      symbol: {
        type: 'simple-marker',
        color: [255, 0, 0],
        size: 12,
        outline: { color: WHITE, width: 2 }
      } as any
    }));
  }  

  private getCitgoSignGraphic(): __esri.Graphic { 
    const { Graphic, GraphicsLayer, Point, SpatialReference } = this.esri;
    const citgo = [42.34915968999376, -71.0964546275122];
    const graphic = new Graphic({
      geometry: new Point({
        latitude: citgo[0],
        longitude: citgo[1],
        spatialReference: new SpatialReference({ wkid: 4326 })
      }),
      symbol: {
        type: 'picture-marker',
        url: '/img/citgo.jpg',
        width: '48px',
        height: '48px',
        yoffset: "12px"
      } as any
    });
    return graphic;
  }

  private addPointLayer(title: string, map: Map, colorArray: number[], pointsArray: [number, number, number | string][], turnOn: boolean = false): __esri.GraphicsLayer {
    const { Graphic, GraphicsLayer, Point, SpatialReference } = this.esri;
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
    const layer = new GraphicsLayer({title: title});
    graphics.forEach(g => layer.add(g));
    map.add(layer);
    layer.visible = turnOn;
    return layer;
  }

  private addHillLayer(map: Map): void {
    const { Graphic, GraphicsLayer, Polyline } = this.esri;
    const hillsLayer = new GraphicsLayer({title: 'Hills'});
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

  private updateTextSymbols(textLayer: GraphicsLayer, pointsArray: [number, number, number | string][], isMileMarker: boolean): void {
    if (!this.view) return;
    const { Graphic, Point, SpatialReference } = this.esri;
    const scale = this.view.scale;
    const offset = Math.sqrt(scale) / 400000;
    textLayer.removeAll();
    if (scale > 126112) return;
    pointsArray.forEach(pt => {
      const textPoint = new Point({
        longitude: pt[1],
        latitude: pt[0] + offset,
        spatialReference: new SpatialReference({ wkid: 4326 })
      });
      const symbol = isMileMarker
        ? {
            type: 'text', angle: 0, color: NAVY, text: String(pt[2]),
            font: { family: 'Arial', size: 20, weight: 'bold' },
            backgroundColor: DARK_YELLOW_ALPHA,
            horizontalAlignment: 'center', verticalAlignment: 'bottom'            
          }
        : {
            type: 'text', angle: 0, color: [255, 255, 255, 1], text: String(pt[2]),
            font: { family: 'Arial', size: 12 },
            horizontalAlignment: 'center', verticalAlignment: 'bottom',
            backgroundColor: '#500000',
          };
      textLayer.add(new Graphic({
        geometry: textPoint,
        symbol: symbol as any
      }));
    });
  }
}
