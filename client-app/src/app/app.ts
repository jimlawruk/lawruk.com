import { Component, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';

const MAP_ROUTES = ['/boston-marathon', '/haunted-places', '/camp-hill-street-lights'];

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  showNav = true;

  constructor(private router: Router, private renderer: Renderer2) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const isMap = MAP_ROUTES.includes(event.urlAfterRedirects);
        this.showNav = !isMap;
        if (isMap) {
          this.renderer.addClass(document.documentElement, 'map-page');
        } else {
          this.renderer.removeClass(document.documentElement, 'map-page');
        }
      }
    });
  }
}
