import { Injectable } from '@angular/core';
import { BanInfo } from '../models';
import { DataService } from './data.service';

@Injectable()
export class SteamService {
  constructor(private _dataService: DataService) {}

  async scanPlayers(steamIds: string[]): Promise<BanInfo[]> {
    return new Promise<BanInfo[]>((resolve, reject) => {
      fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${
          this._dataService.database.apiKey
        }&steamids=${steamIds.join(',')}`,
      )
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            throw Error(`Code ${res.status}. ${res.statusText}`);
          }
        })
        .then((data) => resolve(data.players || []))
        .catch((error) => reject(error));
    });
  }
}
