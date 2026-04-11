import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BostonMarathonComponent } from './boston-marathon.component';

@NgModule({
  declarations: [BostonMarathonComponent],
  imports: [CommonModule, RouterModule.forChild([{ path: '', component: BostonMarathonComponent }])]
})
export class BostonMarathonModule {}
