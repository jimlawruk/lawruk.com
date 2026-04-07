import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { StreetLightsComponent } from './street-lights.component';

@NgModule({
  declarations: [StreetLightsComponent],
  imports: [RouterModule.forChild([{ path: '', component: StreetLightsComponent }])]
})
export class StreetLightsModule {}
