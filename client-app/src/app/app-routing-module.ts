import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './components/home/home.component';
import { RaceResultsComponent } from './components/race-results/race-results.component';
import { RaceDetailComponent } from './components/race-detail/race-detail.component';
import { BlogPostComponent } from './components/blog-post/blog-post.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'race-results', component: RaceResultsComponent },
  { path: 'race-results/:url', component: RaceDetailComponent },
  { path: 'blog/traffic-disparities-in-pa-due-to-solar-eclipse', loadChildren: () => import('./components/traffic-disparities/traffic-disparities.module').then(m => m.TrafficDisparitiesModule) },
  { path: 'blog/:slug', component: BlogPostComponent },
  { path: 'boston-marathon', loadChildren: () => import('./components/boston-marathon/boston-marathon.module').then(m => m.BostonMarathonModule) },
  { path: 'haunted-places', loadChildren: () => import('./components/haunted-places/haunted-places.module').then(m => m.HauntedPlacesModule) },
  { path: 'camp-hill-street-lights', loadChildren: () => import('./components/street-lights/street-lights.module').then(m => m.StreetLightsModule) },
  { path: '**', redirectTo: '' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { useHash: false })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
