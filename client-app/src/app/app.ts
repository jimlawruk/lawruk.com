import { Component, Renderer2 } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Title } from '@angular/platform-browser';
import { AnalyticsService } from './services/analytics.service';

const MAP_ROUTES = ['/boston-marathon', '/haunted-places', '/camp-hill-street-lights'];

@Component({
  selector: 'app-root',
  templateUrl: './app.html',
  standalone: false,
  styleUrl: './app.css'
})
export class App {
  showNav = true;

  constructor(private router: Router, private renderer: Renderer2, private titleService: Title, private analytics: AnalyticsService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationEnd) {
        const isMap = MAP_ROUTES.includes(event.urlAfterRedirects);
        this.showNav = !isMap;
        if (isMap) {
          this.renderer.addClass(document.documentElement, 'map-page');
        } else {
          this.renderer.removeClass(document.documentElement, 'map-page');
        }
        // Defer so the component's titleService.setTitle() has run first
        setTimeout(() => this.analytics.trackPageView(event.urlAfterRedirects, this.titleService.getTitle()), 0);
      }
    });
  }
}
