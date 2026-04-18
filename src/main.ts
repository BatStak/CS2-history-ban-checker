import { enableProdMode, provideZoneChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

enableProdMode();

bootstrapApplication(AppComponent, { providers: [provideZoneChangeDetection()] }).catch((err) => console.error(err));
