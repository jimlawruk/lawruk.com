import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { TrafficDisparitiesComponent } from './traffic-disparities.component';

@NgModule({
  declarations: [TrafficDisparitiesComponent],
  imports: [RouterModule.forChild([{ path: '', component: TrafficDisparitiesComponent }])]
})
export class TrafficDisparitiesModule {}
