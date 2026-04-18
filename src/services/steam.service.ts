import { inject, Injectable } from '@angular/core';
import { BanInfo } from '../models';
import { DataService } from './data.service';

export interface PlayerSummary {
    steamid: string;
    personaname: string;
    profileurl: string;
    avatar: string;
    avatarmedium: string;
    avatarfull: string;
}

@Injectable({ providedIn: 'root' })
export class SteamService {
    readonly dataService = inject(DataService);

    async scanPlayers(steamIds: string[]): Promise<BanInfo[]> {
        return new Promise<BanInfo[]>((resolve, reject) => {
            fetch(
                `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${this.dataService.database.apiKey}&steamids=${steamIds.join(',')}`,
            ).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw Error(`Code ${res.status}. ${res.statusText}`);
                }
            }).then((data) => resolve(data.players || [])).catch((error) => reject(error));
        });
    }

    async getPlayerSummaries(steamIds: string[]): Promise<PlayerSummary[]> {
        return new Promise<PlayerSummary[]>((resolve, reject) => {
            fetch(
                `https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${this.dataService.database.apiKey}&steamids=${steamIds.join(',')}`,
            ).then((res) => {
                if (res.ok) {
                    return res.json();
                } else {
                    throw Error(`Code ${res.status}. ${res.statusText}`);
                }
            }).then((data) => resolve(data.response.players || [])).catch((error) => reject(error));
        });
    }
}