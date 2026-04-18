import { Component, effect, inject, input } from "@angular/core";
import { MatchInfo, PlayerInfo } from "../../../models";
import { DataService } from "../../../services/data.service";
import { CommonModule, DatePipe } from "@angular/common";
import { MapNamePipe } from "../../../pipes/mapName.pipe";
import { MapImagePipe } from "../../../pipes/mapImage.pipe";


type columnType = 'name' | 'lastPlayWith' | 'LastBanOn';

@Component({
    selector: 'cs2-history-ban-list',
    imports: [CommonModule, DatePipe, MapNamePipe, MapImagePipe],
    templateUrl: './ban-list.component.html',
    styleUrl: './ban-list.component.scss',
})
export class BanListComponent {
    readonly dataService = inject(DataService);

    displayMatchInfo = input.required<boolean>();
    playersBanned = input.required<PlayerInfo[]>();

    column: columnType = 'LastBanOn';
    order = 'desc';

    matchInfoIndex?: number;
    matchInfo?: MatchInfo;

    constructor() {
        effect(() => {
            this.sort()
        });
    }

    orderBy(column: columnType) {
        if (this.column === column) {
            this.order = this.order === 'asc' ? 'desc' : 'asc';
        } else {
            this.order = 'asc';
        }
        this.column = column;

        this.closeMatchInfo();
        this.sort();
    }

    closeMatchInfo() {
        this.matchInfo = undefined;
    }

    sort() {
        this.playersBanned().sort((a, b) => {
            switch (this.column) {
                case 'LastBanOn':
                    if (!a.banInfo?.LastBanOn || !b.banInfo?.LastBanOn || a.banInfo.LastBanOn === b.banInfo.LastBanOn) {
                        break;
                    }
                    return a.banInfo.LastBanOn < b.banInfo.LastBanOn
                        ? this.order === 'asc'
                            ? -1
                            : 1
                        : this.order === 'asc'
                            ? 1
                            : -1;
                case 'lastPlayWith':
                    if (!a.lastPlayWith || !b.lastPlayWith || a.lastPlayWith === b.lastPlayWith) {
                        break;
                    }
                    return a.lastPlayWith < b.lastPlayWith ? (this.order === 'asc' ? -1 : 1) : this.order === 'asc' ? 1 : -1;
            }
            return (a.name || '') < (b.name || '') ? (this.order === 'asc' ? -1 : 1) : this.order === 'asc' ? 1 : -1;
        });
    }

    showMatch(matchId?: string, index?: number) {
        if (matchId) {
            this.matchInfoIndex = index;
            this.matchInfo = this.dataService.filteredMatches.find((match) => match.id === matchId);
        }
    }


    getBanTitle(playerInfo: PlayerInfo) {
        return this.dataService.getBanTitle(playerInfo);
    }


    playerIsBanned(steamID64: string) {
        return this.dataService.playersBanned.some(
            (p) => p.steamID64 === steamID64 && p.banInfo!.LastBanOn > p.lastPlayWith!,
        );
    }

    playerInfo(steamID64: string) {
        return this.dataService.filteredPlayers.find((p) => p.steamID64 === steamID64)!;
    }

    getPlayerLink(steamID64: string) {
        return this.dataService.filteredPlayers.find((p) => p.steamID64 === steamID64)?.profileLink;
    }

    getPlayerAvatar(steamID64: string) {
        return this.dataService.filteredPlayers.find((p) => p.steamID64 === steamID64)?.avatarLink;
    }

    getPlayerName(steamID64: string) {
        return this.dataService.filteredPlayers.find((p) => p.steamID64 === steamID64)?.name;
    }

}