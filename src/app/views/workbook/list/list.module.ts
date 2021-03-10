import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { MlButtonModule } from '@material-lite/angular/button';
import { MlRippleModule } from '@material-lite/angular/core';
import { NotMatchedModule } from 'src/app/components/not-matched/not-matched.module';
import { WorkbookListRoutingModule } from './list-routing.module';
import { WorkbookListComponent } from './list.component';

@NgModule({
  declarations: [WorkbookListComponent],
  imports: [
    CommonModule,
    NotMatchedModule,
    MlRippleModule,
    MlButtonModule,
    WorkbookListRoutingModule,
  ],
})
export class WorkbookListModule { }
