import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { AppMetaData } from './app-meta.service';
import { HomeComponent } from './views/home/home.component';

export interface AppRouteData extends AppMetaData {
  key: string;
  parentKey?: string;
}

export interface AppRoute extends Route {
  data?: AppRouteData;
}

export type AppRoutes = AppRoute[];


const routes: AppRoutes = [
  {
    path: 'home',
    component: HomeComponent,
    data: {
      key: 'home',
      title: 'Home'
    }
  },
  {
    path: 'workbook-game/:id',
    loadChildren: () => import('./views/workbook/game').then((m) => m.WorkbookGameModule),
    data: {
      key: 'workbook-game',
      title: 'Workbook'
    }
  },
  {
    path: 'workbook-list',
    loadChildren: () => import('./views/workbook/list').then((m) => m.WorkbookListModule),
    data: {
      key: 'workbook-list',
      title: 'Workbook'
    }
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { relativeLinkResolution: 'legacy' })],
  exports: [RouterModule]
})
export class AppRoutingModule { }
