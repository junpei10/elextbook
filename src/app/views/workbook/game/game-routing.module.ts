import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { WorkbookGameComponent } from './game.component';

const routes: Routes = [
  { path: '', component: WorkbookGameComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class WorkbookGameRoutingModule { }
