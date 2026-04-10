import { Injectable } from '@angular/core';

declare var google: any;

export interface StreetViewOptions {
  onShow: () => void;
  onNotFound: () => void;
  onCreated: (initialHeading: number) => void;
  onPovChanged: (heading: number, lat: number, lon: number) => void;
  initialHeading?: number;
  initialPitch?: number;
  zoom?: number;
}

@Injectable({ providedIn: 'root' })
export class StreetViewService {

  buildArrowSvg(fillColor: string, strokeColor: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 40">
      <polygon points="10,0 20,18 13,18 13,40 7,40 7,18 0,18"
        fill="${fillColor}" stroke="${strokeColor}" stroke-width="1.5"/>
    </svg>`;
  }

  showAt(container: HTMLElement, lat: number, lon: number, options: StreetViewOptions): void {
    if (typeof google === 'undefined') return;
    const heading = options.initialHeading ?? 34;
    const svc = new google.maps.StreetViewService();
    svc.getPanorama({ location: { lat, lng: lon }, radius: 50 }, (_data: any, status: any) => {
      if (status === 'OK') {
        options.onShow();
        const panorama = new google.maps.StreetViewPanorama(container, {
          position: { lat, lng: lon },
          pov: { heading, pitch: options.initialPitch ?? 10 },
          zoom: options.zoom ?? 1
        });
        options.onCreated(heading);
        panorama.addListener('pov_changed', () => {
          const pov = panorama.getPov();
          const pos = panorama.getPosition();
          options.onPovChanged(pov.heading, pos ? pos.lat() : lat, pos ? pos.lng() : lon);
        });
      } else {
        options.onNotFound();
      }
    });
  }
}
