import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { NavComponent } from './components/nav/nav.component';
import { HomeComponent } from './components/home/home.component';
import { RaceResultsComponent } from './components/race-results/race-results.component';
import { RaceDetailComponent } from './components/race-detail/race-detail.component';
import { BlogPostComponent } from './components/blog-post/blog-post.component';

@NgModule({
  declarations: [
    App,
    NavComponent,
    HomeComponent,
    RaceResultsComponent,
    RaceDetailComponent,
    BlogPostComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    FormsModule,
    AppRoutingModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners()
  ],
  bootstrap: [App]
})
export class AppModule { }
