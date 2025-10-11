import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { MatchInfo, PlayerInfo } from '../../../models';
import { MapImagePipe } from '../../../pipes/mapImage.pipe';
import { MapNamePipe } from '../../../pipes/mapName.pipe';
import { DataService } from '../../../services/data.service';
import { MapDatasComponent } from '../map-datas/map-datas.component';

type columnType = 'name' | 'lastPlayWith' | 'LastBanOn';

@Component({
  selector: 'cs2-history-ban-statistics',
  imports: [CommonModule, MapNamePipe, MapImagePipe, MapDatasComponent],
  templateUrl: './ban-statistics.component.html',
  styleUrl: './ban-statistics.component.scss',
})
export class BanStatisticsComponent implements OnDestroy {
  _dataService = inject(DataService);

  displayListOfBannedPlayers = true;
  displayOnlyListOfPlayers = false;

  playersCount = 0;
  bannedCount = 0;
  bannedPourcentage = 0;

  matchesCount = 0;
  matchesConcerned = 0;
  matchPourcentage = 0;

  matchesAgainstCheaters = 0;
  matchesWithCheaters = 0;
  matchesBothTeamsHasCheaters = 0;
  matchesAgainstCheatersPercentage = 0;
  matchesWithCheatersPercentage = 0;
  matchesBothTeamsHasCheatersPercentage = 0;
  unlucky = false;

  matchInfoIndex?: number;
  matchInfo?: MatchInfo;

  order = 'desc';
  column: columnType = 'LastBanOn';

  get playersBanned(): PlayerInfo[] {
    return this._dataService.playersBannedFiltered;
  }

  get players(): PlayerInfo[] {
    return this._dataService.filteredPlayers;
  }

  _onStatisticsUpdatedSubscription?: Subscription;

  constructor() {
    this._onStatisticsUpdatedSubscription = this._dataService.onStatisticsUpdated.subscribe(() => {
      this._update();
    });

    this._update();
  }

  orderBy(column: columnType) {
    if (this.column === column) {
      this.order = this.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.order = 'asc';
    }
    this.column = column;

    this._closeMatchInfo();
    this._sort();
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

  _playerInfo(steamID64: string) {
    return this._dataService.filteredPlayers.find((p) => p.steamID64 === steamID64)!;
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

  _getBanTitle(playerInfo: PlayerInfo) {
    return this._dataService.getBanTitle(playerInfo);
  }

  _update() {
    this.matchesAgainstCheaters = 0;
    this.matchesWithCheaters = 0;
    this.matchesBothTeamsHasCheaters = 0;

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

    this._calculateUnluckyStats(filteredMatches);

    this._sort();
  }

  _calculateUnluckyStats(filteredMatches: MatchInfo[]) {
    if (this.matchesConcerned > 0) {
      filteredMatches.forEach((match) => {
        const userTeam = match.teamA?.scores?.some((player) => player.steamID64 === this._dataService.mySteamId)
          ? 'A'
          : 'B';
        const cheaterInTeamA = match.teamA?.scores?.some((player) =>
          this.playersBanned.some((cheater) => cheater.steamID64 === player.steamID64),
        );
        const cheaterInTeamB = match.teamB?.scores?.some((player) =>
          this.playersBanned.some((cheater) => cheater.steamID64 === player.steamID64),
        );

        if (cheaterInTeamA && cheaterInTeamB) {
          this.matchesBothTeamsHasCheaters++;
        } else if (userTeam === 'A') {
          if (cheaterInTeamA) {
            this.matchesWithCheaters++;
          } else {
            this.matchesAgainstCheaters++;
          }
        } else if (userTeam === 'B') {
          if (cheaterInTeamB) {
            this.matchesWithCheaters++;
          } else {
            this.matchesAgainstCheaters++;
          }
        }
      });

      this.matchesAgainstCheatersPercentage =
        Math.round((this.matchesAgainstCheaters / this.matchesConcerned) * 10000) / 100;
      this.matchesWithCheatersPercentage = Math.round((this.matchesWithCheaters / this.matchesConcerned) * 10000) / 100;
      this.matchesBothTeamsHasCheatersPercentage =
        Math.round((this.matchesBothTeamsHasCheaters / this.matchesConcerned) * 10000) / 100;

      this.unlucky = this.matchesAgainstCheatersPercentage > this.matchesWithCheatersPercentage;
    }
  }

  _sort() {
    this.playersBanned.sort((a, b) => {
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
}
