import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BostonMarathonComponent } from './boston-marathon.component';

@NgModule({
  declarations: [BostonMarathonComponent],
  imports: [RouterModule.forChild([{ path: '', component: BostonMarathonComponent }])]
})
export class BostonMarathonModule {}
