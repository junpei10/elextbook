import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { MlTheming, ML_DEEPPURPLE_AMBER_PALETTE, ML_LIGHT_THEME } from '@material-lite/angular/core';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

import firebase from 'firebase/app';
import { FIREBASE_CONFIG } from './db/firebase';

firebase.initializeApp(FIREBASE_CONFIG);

MlTheming.init([{
  theme: ML_LIGHT_THEME, palette: ML_DEEPPURPLE_AMBER_PALETTE
}]);

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
