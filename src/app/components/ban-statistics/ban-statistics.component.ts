import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { BanInfo, MatchInfo, PlayerInfo } from '../../../models';
import { DataService } from '../../../services/data.service';
import {
  ancientBase64,
  anubisBase64,
  dust2Base64,
  infernoBase64,
  mirageBase64,
  nukeBase64,
  overpassBase64,
  vertigoBase64,
} from './maps.base64';

@Component({
  selector: 'cs2-history-ban-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ban-statistics.component.html',
  styleUrl: './ban-statistics.component.scss',
})
export class BanStatisticsComponent implements OnDestroy {
  displayListOfBannedPlayers = false;
  displayOnlyListOfPlayers = false;

  playersCount = 0;
  bannedCount = 0;
  bannedPourcentage = 0;

  matchesCount = 0;
  matchesConcerned = 0;
  matchPourcentage = 0;

  matchInfoIndex?: number;
  matchInfo?: MatchInfo;

  get playersBanned(): PlayerInfo[] {
    return this._dataService.playersBannedFiltered;
  }

  get players(): PlayerInfo[] {
    return this._dataService.filteredPlayers;
  }

  _onStatisticsUpdatedSubscription?: Subscription;

  constructor(public _dataService: DataService) {
    this._onStatisticsUpdatedSubscription = this._dataService.onStatisticsUpdated.subscribe(() => {
      this._update();
    });

    this._update();
  }

  ngOnDestroy(): void {
    this._onStatisticsUpdatedSubscription?.unsubscribe();
  }

  _getPlayerLink(steamID64: string) {
    return this._dataService.filteredPlayers.find((p) => p.steamID64 === steamID64)?.profileLink;
  }

  _getPlayerAvatar(steamID64: string) {
    return this._dataService.filteredPlayers.find((p) => p.steamID64 === steamID64)?.avatarLink;
  }

  _getPlayerName(steamID64: string) {
    return this._dataService.filteredPlayers.find((p) => p.steamID64 === steamID64)?.name;
  }

  _getMapImage(map?: string) {
    switch (map) {
      case 'Ancient':
        return ancientBase64;
      case 'Anubis':
        return anubisBase64;
      case 'Dust II':
        return dust2Base64;
      case 'Inferno':
        return infernoBase64;
      case 'Mirage':
        return mirageBase64;
      case 'Nuke':
        return nukeBase64;
      case 'Overpass':
        return overpassBase64;
      case 'Vertigo':
        return vertigoBase64;
    }

    return '';
  }

  _playerIsBanned(steamID64: string) {
    return this._dataService.playersBanned.some(
      (p) => p.steamID64 === steamID64 && p.banInfo!.LastBanOn > p.lastPlayWith!,
    );
  }

  _showMatch(matchId?: string, index?: number) {
    if (matchId) {
      this.matchInfoIndex = index;
      this.matchInfo = this._dataService.filteredMatches.find((match) => match.id === matchId);
    }
  }

  _closeMatchInfo() {
    this.matchInfo = undefined;
  }

  _getBanInfos(banInfo?: BanInfo) {
    let infos = '';
    if (banInfo?.NumberOfVACBans) {
      infos += `${banInfo?.NumberOfVACBans} VAC ban${banInfo?.NumberOfVACBans > 1 ? 's' : ''}`;
    }
    if (banInfo?.NumberOfGameBans) {
      infos += `${infos ? ', ' : ''}${banInfo?.NumberOfGameBans} Game ban${banInfo?.NumberOfGameBans > 1 ? 's' : ''}`;
    }
    if (banInfo?.DaysSinceLastBan !== undefined) {
      infos += `, last ban was ${this._getFormatedStringFromDays(banInfo?.DaysSinceLastBan)} ago`;
    }
    return infos;
  }

  _update() {
    this.playersCount = this._dataService.filteredPlayers.length;
    this.bannedCount = this.playersBanned.length;
    this.bannedPourcentage = this.playersCount ? Math.round((this.bannedCount / this.playersCount) * 10000) / 100 : 0;

    this.matchesCount = this._dataService.filteredMatches.length;
    const filteredMatches = this._dataService.filteredMatches.filter((m) =>
      this.playersBanned.some((p) => m.playersSteamID64.includes(p.steamID64)),
    );
    this.matchesConcerned = filteredMatches.length || 0;
    this.matchPourcentage = this.matchesCount
      ? Math.round((this.matchesConcerned / this.matchesCount) * 10000) / 100
      : 0;

    this.displayOnlyListOfPlayers = !this._dataService.section;
    if (this.displayOnlyListOfPlayers) {
      this.displayListOfBannedPlayers = true;
    }
  }

  private _getFormatedStringFromDays(numberOfDays: number) {
    var years = Math.floor(numberOfDays / 365);
    var months = Math.floor((numberOfDays % 365) / 30);
    var days = Math.floor((numberOfDays % 365) % 30);

    var yearsDisplay = years > 0 ? years + (years == 1 ? ' year, ' : ' years, ') : '';
    var monthsDisplay = months > 0 ? months + (months == 1 ? ' month, ' : ' months, ') : '';
    var daysDisplay = days > 0 ? days + (days == 1 ? ' day' : ' days') : '';
    return yearsDisplay + monthsDisplay + daysDisplay;
  }
}
