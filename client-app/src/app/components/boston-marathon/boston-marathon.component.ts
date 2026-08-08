import { Component, AfterViewInit, OnDestroy, ElementRef, ViewChild } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { HttpClient } from '@angular/common/http';
import type Map from '@arcgis/core/Map.js';
import type MapView from '@arcgis/core/views/MapView.js';
import type GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import { Chart } from 'chart.js';
import { ArcGISLoaderService, ArcGISClasses } from '../../services/arcgis-loader.service';
import { ElevationChartService, ElevationPoint } from '../../services/elevation-chart.service';
import { StreetViewService } from '../../services/street-view.service';
import { AnalyticsService } from '../../services/analytics.service';
import { not } from 'rxjs/internal/util/not';

const NAVY: number[] = [0, 0, 128];
const NAVY_ALPHA: number[] = [0, 0, 128, 0.8];
const DARK_YELLOW: number[] = [218, 165, 32];
const DARK_YELLOW_ALPHA: number[] = [218, 165, 32, 0.85];
const WHITE: number[] = [255, 255, 255];
const GEL_STATION_COLOR: number[] = [154, 205, 50];
const HIGHLIGHT_COLOR: number[] = [135, 206, 235];

const mileMarkers: [number, number, number | string][] = [
  [42.2297210, -71.5181970, 'Start'],
  [42.23648823, -71.50173820, 1],
  [42.24229067, -71.48399896, 2],
  [42.25233335, -71.47058121, 3],
  [42.25881319, -71.45376242, 4],
  [42.27088071, -71.44377253, 5],
  [42.27331953, -71.42684091, 6],
  [42.27850074, -71.40863962, 7],
  [42.28196959, -71.38967372, 8],
  [42.28344697, -71.37019552, 9],
  [42.28328103, -71.35114880, 10],
  [42.28791064, -71.33303083, 11],
  [42.29534510, -71.31599075, 12],
  [42.29610199, -71.29642136, 13],
  [42.30535354, -71.28273673, 14],
  [42.31598317, -71.26953087, 15],
  [42.32566014, -71.25661737, 16],
  [42.33543278, -71.24247409, 17],
  [42.33899071, -71.22837588, 18],
  [42.33792898, -71.21048338, 19],
  [42.33617729, -71.19246430, 20],
  [42.33709726, -71.17335088, 21],
  [42.33862191, -71.15539617, 22],
  [42.33857929, -71.13788000, 23],
  [42.34257713, -71.11916757, 24],
  [42.34777108, -71.10080517, 25],
  [42.34847157, -71.08335687, 26],
  [42.34975908098082, -71.07861399650574, 'Finish']  
];

const gelStations: [number, number][] = [
  [42.29386311, -71.32099101],
  [42.33444636, -71.24390169],
  [42.34003849, -71.16152770],
];

const startingArea: number[][] = [
  [42.21956067, -71.52137823],
  [42.21771729, -71.52059502],
  [42.21759810, -71.52098126],
  [42.21684325, -71.52062721],
  [42.21695449, -71.51999421],
  [42.21647774, -71.51969380],
  [42.21662871, -71.51858873],
  [42.21691476, -71.51647515],
  [42.21807485, -71.51710815],
  [42.21961629, -71.51796646],
  [42.21985466, -71.51857800],
  [42.21972753, -71.51912517],
  [42.21996589, -71.51937193],
  [42.22014069, -71.51950068],
];

const busLoading: number[][][] = [
  [
  [42.35570489, -71.06916315],
  [42.35289026, -71.06761283]
]];

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

const notableSpotLabels: [number, number, string][] = [
  [42.33613, -71.18562, 'Heartbreak Hill'],
  [42.35430, -71.06838, 'Bus Loading Area'],
  [42.21830, -71.51900, 'Athletes\' Village'],
  [42.34916, -71.09645, ''],
  [42.34062175509552, -71.23860881147961, 'Firehouse'],
  [42.336120779553106, -71.17863482952106, 'Top of Heartbreak'],
  [42.358822895613926, -71.05694108486482, 'Boston Massacre'],
  [42.36632673826361, -71.05447249944879, 'Old North Church'],
];

for (const item in gelStations) {
  notableSpotLabels.push([gelStations[item][0], gelStations[item][1], 'Gel Station']);
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

  public elevationCollapsed = false;
  public clickedLocation: string | null = null;
  private view: MapView | null = null;
  private elevationChart: Chart | null = null;
  private elevationData: ElevationPoint[] = [];
  private clickMarkerLayer: GraphicsLayer | null = null;
  private streetViewMarkerLayer: GraphicsLayer | null = null;
  private streetViewEnabled = false;
  private lastStreetViewPos: { lat: number; lon: number } | null = null;
  private mbtaLinesLayer: any = null;
  private mbtaStationsLayer: any = null;
  private mbtaRailStationsLayer: any = null;
  private citgoGraphic: any = null;
  private highlightHandle: any = null;
  private esri!: ArcGISClasses;

  constructor(private titleService: Title, private http: HttpClient, private arcgisLoader: ArcGISLoaderService, private elevationService: ElevationChartService, private streetViewService: StreetViewService, private analytics: AnalyticsService) {
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

    this.view.highlightOptions = { color: HIGHLIGHT_COLOR } as any;

    const basemapToggle = new BasemapToggle({ view: this.view, nextBasemap: 'satellite' });
    this.view.ui.add(basemapToggle, 'bottom-right');

    const locate = new Locate({ view: this.view });
    this.view.ui.add(locate, 'top-left');

    const layerList = new LayerList({ view: this.view });
    const expand = new Expand({ view: this.view, content: layerList, expanded: false, expandTooltip: 'Layers' });
    this.view!.ui.add(expand, 'top-right');

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
      url: 'https://services.arcgis.com/DO4gTjwJVIJ7O9Ca/ArcGIS/rest/services/Boston_Marathon_Route/FeatureServer/0',
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
        const lat = e.mapPoint.latitude as number;
        const lon = e.mapPoint.longitude as number;
        this.clickedLocation = `${lat.toFixed(8)}, ${lon.toFixed(8)}`;
        this.analytics.trackMapClick('Boston Marathon', lat, lon);
        this.onPolylineClick(lat, lon);
        this.queryMbtaPopup(lat, lon, e.mapPoint);
        if (this.streetViewEnabled) {
          this.lastStreetViewPos = { lat: e.mapPoint.latitude, lon: e.mapPoint.longitude };
          this.showStreetViewAt(e.mapPoint.latitude, e.mapPoint.longitude);
        }
      }
    });

    const notableLabelsLayer = this.addNotableRaceSpots(map);

    const mbtaRailLinesLayer = new FeatureLayer({
      url: 'https://services.arcgis.com/sFnw0xNflSi8J0uh/ArcGIS/rest/services/MBTA_Commuter_Rail/FeatureServer/2',
      title: 'MBTA Rail Lines',
      visible: true,
      renderer: {
        type: 'simple',
        symbol: { type: 'simple-line', color: [128, 0, 128], width: 3 }
      } as any
    });
    map.add(mbtaRailLinesLayer);

    const mbtaRailStationsLayer = new FeatureLayer({
      url: 'https://services.arcgis.com/sFnw0xNflSi8J0uh/ArcGIS/rest/services/MBTA_Commuter_Rail/FeatureServer/1',
      title: 'MBTA Rail Stations',
      visible: true,
      minScale: 126000,
      renderer: {
        type: 'simple',
        symbol: { type: 'simple-marker', color: [128, 0, 128], size: 8, outline: { color: [255, 255, 255], width: 1 } }
      } as any
    });
    this.mbtaRailStationsLayer = mbtaRailStationsLayer;
    map.add(mbtaRailStationsLayer);

    const mbtaLinesLayer = new FeatureLayer({
      url: 'https://services1.arcgis.com/jIRgb54Jq9V3BUeD/ArcGIS/rest/services/MBTA_Rapid_Transit_Lines_Apr23/FeatureServer/0',
      title: 'MBTA Transit Lines',
      visible: true,
      renderer: {
        type: 'unique-value',
        field: 'LINE',
        uniqueValueInfos: [
          { value: 'GREEN',  symbol: { type: 'simple-line', color: [0, 135, 68],   width: 3 } },
          { value: 'RED',    symbol: { type: 'simple-line', color: [218, 41, 28],  width: 3 } },
          { value: 'BLUE',   symbol: { type: 'simple-line', color: [0, 61, 165],   width: 3 } },
          { value: 'ORANGE', symbol: { type: 'simple-line', color: [255, 130, 0],  width: 3 } },
          { value: 'SILVER', symbol: { type: 'simple-line', color: [175, 175, 175], width: 3 } },
        ]
      } as any
    });
    this.mbtaLinesLayer = mbtaLinesLayer;
    map.add(mbtaLinesLayer);

    const mbtaStationsLayer = new FeatureLayer({
      url: 'https://services.arcgis.com/sFnw0xNflSi8J0uh/ArcGIS/rest/services/MBTA_Stops/FeatureServer/0',
      title: 'MBTA T Stations',
      visible: true,
      minScale: 126000,
      renderer: {
        type: 'unique-value',
        field: 'LINE',
        uniqueValueInfos: [
          { value: 'GREEN',  symbol: { type: 'simple-marker', color: [0, 135, 68],    size: 8, outline: { color: [255,255,255], width: 1 } } },
          { value: 'RED',    symbol: { type: 'simple-marker', color: [218, 41, 28],   size: 8, outline: { color: [255,255,255], width: 1 } } },
          { value: 'BLUE',   symbol: { type: 'simple-marker', color: [0, 61, 165],    size: 8, outline: { color: [255,255,255], width: 1 } } },
          { value: 'ORANGE', symbol: { type: 'simple-marker', color: [255, 130, 0],   size: 8, outline: { color: [255,255,255], width: 1 } } },
          { value: 'SILVER', symbol: { type: 'simple-marker', color: [175, 175, 175], size: 8, outline: { color: [255,255,255], width: 1 } } },
        ]
      } as any
    });
    this.mbtaStationsLayer = mbtaStationsLayer;
    map.add(mbtaStationsLayer);

    this.addPointLayer('Mile Markers', map, DARK_YELLOW, mileMarkers, true);
    const textMileMarkersLayer = new GraphicsLayer({ title: 'Mile Marker Labels' });
    this.updateTextSymbols(textMileMarkersLayer, mileMarkers, false);
    map.add(textMileMarkersLayer);
    this.view.when(() => {
      this.addStreetViewToggleWidget();
      map.allLayers.forEach((layer: any) => {
        layer.watch('visible', (visible: boolean) => {
          this.analytics.trackLayerToggle('Boston Marathon', layer.title ?? 'Unknown', visible);
        });
      });
      this.view?.popup?.watch('visible', (visible: boolean) => {
        if (!visible) {
          this.highlightHandle?.remove();
          this.highlightHandle = null;
        }
      });
    });
    this.view.watch('scale', () => {
      this.updateTextSymbols(textMileMarkersLayer, mileMarkers, true);
      this.updateTextSymbols(notableLabelsLayer, notableSpotLabels, false, 20000);
      this.updateCitgoSize();
    });

    this.loadGpxAndBuildChart();
  }

  ngOnDestroy(): void {
    this.elevationChart?.destroy();
    this.view?.destroy();
  }

  public toggleElevationChart(): void {
    this.elevationCollapsed = !this.elevationCollapsed;
    if (!this.elevationCollapsed) {
      // Let the DOM update before resizing so Chart.js gets the correct canvas dimensions
      setTimeout(() => this.elevationChart?.resize(), 0);
    }
  }

  public onStreetViewToggle(enabled: boolean): void {
    this.streetViewEnabled = enabled;
    if (!enabled) {
      this.hideStreetView();
    } else if (this.lastStreetViewPos) {
      this.showStreetViewAt(this.lastStreetViewPos.lat, this.lastStreetViewPos.lon);
    }
  }

  private addStreetViewToggleWidget(): void {
    if (window.innerWidth <= 600) return;
    const toggleDiv = document.createElement('div');
    toggleDiv.style.cssText = 'background:white;padding:6px 10px;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,0.3);font-size:13px;display:flex;align-items:center;gap:6px;cursor:pointer;';
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'sv-toggle';
    checkbox.checked = false;
    checkbox.style.cursor = 'pointer';
    const label = document.createElement('label');
    label.htmlFor = 'sv-toggle';
    label.textContent = 'Street View';
    label.style.cursor = 'pointer';
    checkbox.addEventListener('change', () => this.onStreetViewToggle(checkbox.checked));
    toggleDiv.appendChild(checkbox);
    toggleDiv.appendChild(label);
    this.view!.ui.add(toggleDiv, 'top-right');
  }

  private updateStreetViewArrow(lat: number, lon: number, heading: number): void {
    if (!this.streetViewMarkerLayer) return;
    const { Graphic, Point, SpatialReference } = this.esri;
    this.streetViewMarkerLayer.removeAll();
    const svg = this.streetViewService.buildArrowSvg('#FFDD00', '#000080');
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
    this.streetViewService.showAt(
      this.streetViewInnerEl.nativeElement,
      lat,
      lon,
      {
        onShow: () => { this.streetViewPanelEl.nativeElement.style.display = 'block'; },
        onNotFound: () => { this.streetViewPanelEl.nativeElement.style.display = 'none'; },
        onCreated: (heading) => this.updateStreetViewArrow(lat, lon, heading),
        onPovChanged: (heading, posLat, posLon) => this.updateStreetViewArrow(posLat, posLon, heading),
        initialHeading: 34,
        initialPitch: 10,
        zoom: 1
      }
    );
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
    this.elevationChart = this.elevationService.buildChart(
      this.elevationCanvasEl.nativeElement,
      this.elevationData,
      dist => this.onChartClick(dist),
      value => value === 26.4 ? 26.2 : value
    ); // show 26.2 instead of 26.4
  }

  private async queryMbtaPopup(lat: number, lon: number, point: any): Promise<void> {
    this.highlightHandle?.remove();
    this.highlightHandle = null;

    const candidates: { layer: any; title: string; toleranceMeters: number }[] = [];
    if (this.mbtaStationsLayer?.visible) candidates.push({ layer: this.mbtaStationsLayer, title: 'MBTA T Station', toleranceMeters: 100 });
    if (this.mbtaRailStationsLayer?.visible) candidates.push({ layer: this.mbtaRailStationsLayer, title: 'MBTA Rail Station', toleranceMeters: 100 });
    // Remove lines if (this.mbtaLinesLayer?.visible)    candidates.push({ layer: this.mbtaLinesLayer,    title: 'MBTA Transit Line', toleranceMeters: 150 });

    const skipFields = new Set(['OBJECTID', 'SHAPE_Length', 'Shape_Length', 'Shape__Length', 'Shape_Area', 'GlobalID', 'CreationDate', 'Creator', 'EditDate', 'Editor']);

    for (const { layer, title, toleranceMeters } of candidates) {
      const result = await layer.queryFeatures({
        geometry: point,
        distance: toleranceMeters,
        units: 'meters',
        spatialRelationship: 'intersects',
        outFields: ['*'],
        returnGeometry: false,
        num: 1
      });
      if (result.features.length > 0) {
        const feature = result.features[0];
        const attrs = feature.attributes as Record<string, unknown>;
        const rows = Object.entries(attrs)
          .filter(([k, v]) => !skipFields.has(k) && v != null && v !== '')
          .map(([k, v]) => `<tr><td style="padding:2px 8px 2px 0;font-weight:bold">${k}</td><td>${v}</td></tr>`)
          .join('');
        const popupTitle = (attrs['STATION'] ?? attrs['STOP_NAME'] ?? attrs['Station'] ?? title) as string;
        this.view?.popup?.open({ title: popupTitle, content: `<table style="font-size:13px">${rows}</table>`, location: point });
        this.view!.whenLayerView(layer).then((layerView: any) => {
          this.highlightHandle = layerView.highlight(feature);
        });
        return;
      }
    }
  }

  private onPolylineClick(lat: number, lon: number): void {
    if (!this.elevationData.length || !this.elevationChart) return;
    const result = this.elevationService.findClosestByLatLon(this.elevationData, lat, lon);
    if (!result || result.distanceSq > 0.01) return; // ignore clicks more than ~0.1 degrees from the route
    this.elevationService.updateChartMarker(this.elevationChart, result.point);
    this.showClickMarker(lat, lon);
  }

  private onChartClick(distance: number): void {
    if (!this.elevationData.length) return;
    const result = this.elevationService.findClosestByDistance(this.elevationData, distance);
    if (!result) return;
    if (this.elevationChart) {
      this.elevationService.updateChartMarker(this.elevationChart, result.point);
    }
    this.showClickMarker(result.point.lat, result.point.lon);
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

  private addPointLayer(title: string, map: Map, colorArray: number[], pointsArray: [number, number, number | string][], turnOn: boolean = false, addLabels: boolean = false): __esri.GraphicsLayer {
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
    const layer = new GraphicsLayer({title: title, listMode: 'show'});
    graphics.forEach(g => layer.add(g));
    if (addLabels) {
      graphics.forEach((g, i) => {
        const labelGraphic = new Graphic({  
          geometry: g.geometry, 
          symbol: {
            type: 'text', angle: 0, color: '#000', text: 'Gel',
            backgroundColor: '#FF8C00',
            font: { family: 'Arial', size: 14, weight: 'bold' },    
            horizontalAlignment: 'center', verticalAlignment: 'bottom'           
          } as any
        });
        layer.add(labelGraphic);
      } );
    }
    map.add(layer);
    layer.visible = turnOn;
    return layer;
  }

  private addNotableRaceSpots(map: Map): GraphicsLayer {
    const { Graphic, GraphicsLayer, Polyline, Polygon, Point, SpatialReference } = this.esri;
    const notableRaceSpots = new GraphicsLayer({ title: 'Notable Race Spots' });

    // Heartbreak Hill
    notableRaceSpots.add(new Graphic({
      geometry: new Polyline({
        hasZ: false, hasM: true,
        paths: hills.map(hill => hill.map(p => [p[1], p[0]])),
        spatialReference: { wkid: 4326 } as any
      }),
      symbol: { type: 'simple-line', color: [200, 0, 0, 0.6], width: 4, style: 'solid' } as any
    }));

    // Bus loading zone
    notableRaceSpots.add(new Graphic({
      geometry: new Polyline({
        hasZ: false, hasM: true,
        paths: busLoading.map(x => x.map(p => [p[1], p[0]])),
        spatialReference: { wkid: 4326 } as any
      }),
      symbol: { type: 'simple-line', color: DARK_YELLOW, width: 4, style: 'solid' } as any
    }));

    // Starting area polygon
    notableRaceSpots.add(new Graphic({
      geometry: new Polygon({
        rings: [startingArea.map(p => [p[1], p[0]])],
        spatialReference: { wkid: 4326 } as any
      }),
      symbol: { type: 'simple-fill', color: [...DARK_YELLOW, 0.25], outline: { color: DARK_YELLOW, width: 2 } } as any
    }));

    // Citgo sign
    this.citgoGraphic = new Graphic({
      geometry: new Point({
        latitude: 42.34915968999376, longitude: -71.0964546275122,
        spatialReference: new SpatialReference({ wkid: 4326 })
      }),
      symbol: { type: 'picture-marker', url: '/img/citgo.jpg', width: '48px', height: '48px', yoffset: '12px' } as any
    });
    notableRaceSpots.add(this.citgoGraphic);

    // Landmarks
    for (const pt of landmarks) {
      notableRaceSpots.add(new Graphic({
        geometry: new Point({ latitude: pt[0], longitude: pt[1], spatialReference: new SpatialReference({ wkid: 4326 }) }),
        symbol: { type: 'simple-marker', color: [20, 20, 0], size: 8, outline: { color: [255, 140, 0], width: 2 } } as any
      }));
    }

    // Gel stations
    for (const pt of gelStations) {
      notableRaceSpots.add(new Graphic({
        geometry: new Point({ latitude: pt[0], longitude: pt[1], spatialReference: new SpatialReference({ wkid: 4326 }) }),
        symbol: { type: 'simple-marker', color: GEL_STATION_COLOR, size: 8, outline: { color: GEL_STATION_COLOR, width: 2 } } as any
      }));
    }

    map.add(notableRaceSpots);

    const labelsLayer = new GraphicsLayer({ title: 'Notable Spot Labels', listMode: 'show' });
    map.add(labelsLayer);
    return labelsLayer;
  }

  private updateCitgoSize(): void {
    if (!this.citgoGraphic || !this.view) return;
    const scale = this.view.scale;
    const size = Math.round(Math.max(16, Math.min(52, 52 * Math.pow(18000 / Math.max(scale, 18000), 0.5))));
    this.citgoGraphic.symbol = { type: 'picture-marker', url: '/img/citgo.jpg', width: `${size}px`, height: `${size}px`, yoffset: `${Math.round(size / 4)}px` };
  }

  private updateTextSymbols(textLayer: GraphicsLayer, pointsArray: [number, number, number | string][], isMileMarker: boolean, maxScale = 186112): void {
    if (!this.view) return;
    const { Graphic, Point, SpatialReference } = this.esri;
    const scale = this.view.scale;
    const offset = Math.sqrt(scale) / 400000;
    textLayer.removeAll();
    if (scale > maxScale) return;
    pointsArray.forEach(pt => {
      const textPoint = new Point({
        longitude: pt[1],
        latitude: pt[0] + offset,
        spatialReference: new SpatialReference({ wkid: 4326 })
      });
      const symbol = isMileMarker
        ? {
            type: 'text', angle: 0, color: NAVY, text: String(pt[2]),
            font: { family: 'Arial', size: 12, weight: 'bold' },
            
            horizontalAlignment: 'center', verticalAlignment: 'bottom',           
            haloColor: DARK_YELLOW_ALPHA,
            haloSize: 30
          }
        : {
            type: 'text', angle: 0, color: NAVY, text: String(pt[2]),
            font: { family: 'Arial', size: 12 },
            horizontalAlignment: 'center', verticalAlignment: 'bottom',            
            haloColor: DARK_YELLOW,
            haloSize: 20
          };
      textLayer.add(new Graphic({
        geometry: textPoint,
        symbol: symbol as any
      }));
    });
  }
}
