import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MlButtonModule } from '@material-lite/angular/button';
import { MlRippleModule } from '@material-lite/angular/core';
import { WorkbookGameRoutingModule } from './game-routing.module';
import { WorkbookGameComponent } from './game.component';

@NgModule({
  declarations: [WorkbookGameComponent],
  imports: [
    CommonModule,
    MlRippleModule,
    MlButtonModule,
    WorkbookGameRoutingModule
  ],
})
export class WorkbookGameModule { }
