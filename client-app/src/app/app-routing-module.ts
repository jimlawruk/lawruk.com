import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RaceResultsComponent } from './components/race-results/race-results.component';
import { RaceDetailComponent } from './components/race-detail/race-detail.component';
import { BlogPostComponent } from './components/blog-post/blog-post.component';
import { BostonMarathonComponent } from './components/boston-marathon/boston-marathon.component';
import { HauntedPlacesComponent } from './components/haunted-places/haunted-places.component';
import { StreetLightsComponent } from './components/street-lights/street-lights.component';
import { TrafficDisparitiesComponent } from './components/traffic-disparities/traffic-disparities.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'race-results', component: RaceResultsComponent },
  { path: 'race-results/:url', component: RaceDetailComponent },
  { path: 'blog/traffic-disparities-in-pa-due-to-solar-eclipse', component: TrafficDisparitiesComponent },
  { path: 'blog/:slug', component: BlogPostComponent },
  { path: 'boston-marathon', component: BostonMarathonComponent },
  { path: 'haunted-places', component: HauntedPlacesComponent },
  { path: 'camp-hill-street-lights', component: StreetLightsComponent },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
