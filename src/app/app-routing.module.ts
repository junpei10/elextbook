import { NgModule } from '@angular/core';
import { Route, RouterModule } from '@angular/router';
import { AppMetaData } from './app-meta.service';
import { HomeComponent } from './views/home/home.component';
import { NotFoundComponent } from './views/not-found/not-found.component';
import { SignInComponent } from './views/sign-in/sign-in.component';
import { SignUpComponent } from './views/sign-up/sign-up.component';

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
  {
    path: 'settings',
    loadChildren: () => import('./views/settings').then((m) => m.SettingsModule),
    data: {
      key: 'settings',
      title: 'Settings',
      parentKeys: []
    }
  },
  {
    path: 'sign-in',
    loadChildren: () => import('./views/sign-in').then((m) => m.SignInModule),
    data: {
      key: 'sign-in',
      title: 'Sign In',
      parentKeys: []
    }
  },
  {
    path: 'sign-up',
    loadChildren: () => import('./views/sign-up').then((m) => m.SignUpModule),
    data: {
      key: 'sign-up',
      title: 'Sign Up',
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
