import { ApplicationConfig } from '@angular/core';
import { DataService } from '../services/data.service';
import { SteamService } from '../services/steam.service';
import { UtilsService } from '../services/utils.service';

export const appConfig: ApplicationConfig = {
  providers: [UtilsService, DataService, SteamService], // provideRouter(routes)
};
