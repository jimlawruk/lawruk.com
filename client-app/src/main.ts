import { platformBrowser } from '@angular/platform-browser';
import { AppModule } from './app/app-module';
import esriConfig from '@arcgis/core/config.js';

esriConfig.assetsPath = 'https://js.arcgis.com/4.34/@arcgis/core/assets';

platformBrowser().bootstrapModule(AppModule, {
  ngZoneEventCoalescing: true,
})
  .catch(err => console.error(err));
