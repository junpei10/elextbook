import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkbookListComponent } from './list.component';

const routes: Routes = [
  { path: '', component: WorkbookListComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkbookListRoutingModule { }
