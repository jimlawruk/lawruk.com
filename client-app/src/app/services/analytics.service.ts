import { Injectable } from '@angular/core';

declare function gtag(command: string, action: string, params?: Record<string, unknown>): void;

@Injectable({ providedIn: 'root' })
export class AnalyticsService {

  trackPageView(url: string, title?: string): void {
    if (typeof gtag === 'undefined') return;
    gtag('event', 'page_view', {
      page_path: url,
      page_title: title ?? document.title,
    });
  }

  trackMapClick(mapName: string, lat: number, lon: number): void {
    if (typeof gtag === 'undefined') return;
    gtag('event', 'map_click', {
      event_category: 'Map',
      event_label: mapName,
      map_lat: lat.toFixed(5),
      map_lon: lon.toFixed(5),
    });
  }

  trackLayerToggle(mapName: string, layerTitle: string, visible: boolean): void {
    if (typeof gtag === 'undefined') return;
    gtag('event', 'layer_toggle', {
      event_category: 'Map',
      event_label: `${mapName} — ${layerTitle}`,
      layer_visible: visible,
    });
  }
}
