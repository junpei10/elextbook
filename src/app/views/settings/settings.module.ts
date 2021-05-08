import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { MlButtonModule } from '@material-lite/angular/button';
import { MlSlideToggleModule } from '@material-lite/angular/slide-toggle';
import { SettingsRoutingModule } from './settings-routing.module';

import { SettingsComponent } from './settings.component';

@NgModule({
  declarations: [SettingsComponent],
  imports: [
    CommonModule,
    SettingsRoutingModule,
    MlSlideToggleModule,
    MlButtonModule
  ],
})
export class SettingsModule { }
