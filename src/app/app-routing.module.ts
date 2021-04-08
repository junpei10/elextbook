import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { AppMetaData } from './app-meta.service';
import { HomeComponent } from './views/home/home.component';
import { NotFoundComponent } from './views/not-found/not-found.component';

export interface AppRouteData extends AppMetaData {
  key: string;
  parentKeys: string[];
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
      title: 'Home',
      parentKeys: []
    }
  },
  {
    path: 'workbook-game/:id',
    loadChildren: () => import('./views/workbook/game').then((m) => m.WorkbookGameModule),
    data: {
      key: 'workbook-game',
      title: 'Workbook',
      parentKeys: []
    }
  },
  {
    path: 'workbook-list',
    loadChildren: () => import('./views/workbook/list').then((m) => m.WorkbookListModule),
    data: {
      key: 'workbook-list',
      title: 'Workbook',
      parentKeys: []
    }
  },
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: '**', component: NotFoundComponent,
    data: {
      key: 'not-found',
      title: 'NotFound',
      parentKeys: []
    }
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
