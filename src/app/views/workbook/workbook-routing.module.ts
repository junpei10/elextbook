import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkbookComponent } from './workbook.component';

const routes: Routes = [
  { path: '', component: WorkbookComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkbookRoutingModule { }
