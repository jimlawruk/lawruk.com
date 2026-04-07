import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { HauntedPlacesComponent } from './haunted-places.component';

@NgModule({
  declarations: [HauntedPlacesComponent],
  imports: [RouterModule.forChild([{ path: '', component: HauntedPlacesComponent }])]
})
export class HauntedPlacesModule {}
