import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MlButtonModule } from '@material-lite/angular/button';
import { MlRippleModule } from '@material-lite/angular/core';
import { MlSlideToggleModule } from '@material-lite/angular/slide-toggle';
import { WorkbookGameRoutingModule } from './game-routing.module';
import { WorkbookGameComponent } from './game.component';
import { RoundingPipe } from './rounding.pipe';

@NgModule({
  declarations: [
    WorkbookGameComponent,
    RoundingPipe
  ],
  imports: [
    CommonModule,
    MlRippleModule,
    MlButtonModule,
    MlSlideToggleModule,
    WorkbookGameRoutingModule
  ],
})
export class WorkbookGameModule { }
