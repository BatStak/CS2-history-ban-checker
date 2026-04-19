import { enableProdMode, provideZonelessChangeDetection } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

enableProdMode();

bootstrapApplication(AppComponent, { providers: [provideZonelessChangeDetection()] }).catch((err) => console.error(err));
