import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { MlButtonModule } from '@material-lite/angular/button';
import { MlPortalModule } from './portal';
import { MlRippleModule } from '@material-lite/angular/core';
import { HomeComponent } from './views/home/home.component';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    MlRippleModule,
    MlButtonModule,
    MlPortalModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
