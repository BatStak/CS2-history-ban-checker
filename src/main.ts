import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';

enableProdMode();

bootstrapApplication(AppComponent).catch((err) => console.error(err));
