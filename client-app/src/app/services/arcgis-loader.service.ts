import { Injectable } from '@angular/core';
import type Map from '@arcgis/core/Map.js';
import type MapView from '@arcgis/core/views/MapView.js';
import type Graphic from '@arcgis/core/Graphic.js';
import type GraphicsLayer from '@arcgis/core/layers/GraphicsLayer.js';
import type FeatureLayer from '@arcgis/core/layers/FeatureLayer.js';
import type Point from '@arcgis/core/geometry/Point.js';
import type Polyline from '@arcgis/core/geometry/Polyline.js';
import type SpatialReference from '@arcgis/core/geometry/SpatialReference.js';
import type SimpleLineSymbol from '@arcgis/core/symbols/SimpleLineSymbol.js';
import type Legend from '@arcgis/core/widgets/Legend.js';
import type esriRequest from '@arcgis/core/request.js';
import type BasemapToggle from '@arcgis/core/widgets/BasemapToggle.js';
import type LayerList from '@arcgis/core/widgets/LayerList.js';
import type Locate from '@arcgis/core/widgets/Locate.js';
import type Expand from '@arcgis/core/widgets/Expand.js';

declare const $arcgis: {
  import: <T = any>(modules: string | string[]) => Promise<T>;
};

export interface ArcGISClasses {
  Map: typeof Map;
  MapView: typeof MapView;
  Graphic: typeof Graphic;
  GraphicsLayer: typeof GraphicsLayer;
  FeatureLayer: typeof FeatureLayer;
  Point: typeof Point;
  Polyline: typeof Polyline;
  SpatialReference: typeof SpatialReference;
  SimpleLineSymbol: typeof SimpleLineSymbol;
  Legend: typeof Legend;
  BasemapToggle: typeof BasemapToggle;
  LayerList: typeof LayerList;
  Locate: typeof Locate;
  Expand: typeof Expand;
  esriRequest: typeof esriRequest;
}

@Injectable({ providedIn: 'root' })
export class ArcGISLoaderService {
  private loadPromise: Promise<ArcGISClasses> | null = null;

  load(): Promise<ArcGISClasses> {
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = this.loadScript().then(async () => {
      const [
        Map,
        MapView,
        Graphic,
        GraphicsLayer,
        FeatureLayer,
        Point,
        Polyline,
        SpatialReference,
        SimpleLineSymbol,
        Legend,
        esriRequest,
        BasemapToggle,
        LayerList,
        Locate,
        Expand,
      ] = await $arcgis.import([
        '@arcgis/core/Map.js',
        '@arcgis/core/views/MapView.js',
        '@arcgis/core/Graphic.js',
        '@arcgis/core/layers/GraphicsLayer.js',
        '@arcgis/core/layers/FeatureLayer.js',
        '@arcgis/core/geometry/Point.js',
        '@arcgis/core/geometry/Polyline.js',
        '@arcgis/core/geometry/SpatialReference.js',
        '@arcgis/core/symbols/SimpleLineSymbol.js',
        '@arcgis/core/widgets/Legend.js',
        '@arcgis/core/request.js',
        '@arcgis/core/widgets/BasemapToggle.js',
        '@arcgis/core/widgets/LayerList.js',
        '@arcgis/core/widgets/Locate.js',
        '@arcgis/core/widgets/Expand.js',
      ]);

      return {
        Map,
        MapView,
        Graphic,
        GraphicsLayer,
        FeatureLayer,
        Point,
        Polyline,
        SpatialReference,
        SimpleLineSymbol,
        Legend,
        esriRequest,
        BasemapToggle,
        LayerList,
        Locate,
        Expand,
      } as ArcGISClasses;
    });

    return this.loadPromise;
  }

  /** Dynamically injects the ArcGIS CDN script so the loader
   *  is NOT present during initial Angular bundle execution. */
  private loadScript(): Promise<void> {
    if ((window as any).$arcgis) return Promise.resolve();

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      //script.type = 'module';
      script.src = `//js.arcgis.com/4.33/`;
      script.onload = () => {
        const arcgis = (window as any).$arcgis;
        // arcgis.config.assetsPath =
        //    "https://js.arcgis.com/4.33/@arcgis/core/assets";
        resolve();
      };
      script.onerror = () =>
        reject(new Error('Failed to load ArcGIS CDN script'));
      document.head.appendChild(script);
    });
  }
}
