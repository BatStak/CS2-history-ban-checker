import { ApplicationConfig } from '@angular/core';
import { UtilsService } from '../services/utils.service';
import { DataService } from '../services/data.service';
import { SteamService } from '../services/steam.service';

export const appConfig: ApplicationConfig = {
  providers: [UtilsService, DataService, SteamService], // provideRouter(routes)
};
