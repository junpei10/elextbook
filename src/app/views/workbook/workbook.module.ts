import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MlButtonModule } from '@material-lite/angular/button';
import { WorkbookRoutingModule } from './workbook-routing.module';
import { WorkbookComponent } from './workbook.component';

@NgModule({
  declarations: [WorkbookComponent],
  imports: [CommonModule, MlButtonModule, WorkbookRoutingModule],
})
export class WorkbookModule { }
