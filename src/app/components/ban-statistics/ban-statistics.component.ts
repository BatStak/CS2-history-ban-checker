import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { differenceInDays, parse } from 'date-fns';
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
  dataService = inject(DataService);

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
  frequencyInDaysOfBans = -1;
  unlucky = false;

  matchInfoIndex?: number;
  matchInfo?: MatchInfo;

  order = 'desc';
  column: columnType = 'LastBanOn';

  get playersBanned(): PlayerInfo[] {
    return this.dataService.playersBannedFiltered;
  }

  get players(): PlayerInfo[] {
    return this.dataService.filteredPlayers;
  }

  _onStatisticsUpdatedSubscription?: Subscription;

  constructor() {
    this._onStatisticsUpdatedSubscription = this.dataService.onStatisticsUpdated.subscribe(() => {
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
    return this.dataService.filteredPlayers.find((p) => p.steamID64 === steamID64)?.profileLink;
  }

  _getPlayerAvatar(steamID64: string) {
    return this.dataService.filteredPlayers.find((p) => p.steamID64 === steamID64)?.avatarLink;
  }

  _getPlayerName(steamID64: string) {
    return this.dataService.filteredPlayers.find((p) => p.steamID64 === steamID64)?.name;
  }

  _playerInfo(steamID64: string) {
    return this.dataService.filteredPlayers.find((p) => p.steamID64 === steamID64)!;
  }

  _playerIsBanned(steamID64: string) {
    return this.dataService.playersBanned.some(
      (p) => p.steamID64 === steamID64 && p.banInfo!.LastBanOn > p.lastPlayWith!,
    );
  }

  _showMatch(matchId?: string, index?: number) {
    if (matchId) {
      this.matchInfoIndex = index;
      this.matchInfo = this.dataService.filteredMatches.find((match) => match.id === matchId);
    }
  }

  _closeMatchInfo() {
    this.matchInfo = undefined;
  }

  _getBanTitle(playerInfo: PlayerInfo) {
    return this.dataService.getBanTitle(playerInfo);
  }

  _update() {
    this.matchesAgainstCheaters = 0;
    this.matchesWithCheaters = 0;
    this.matchesBothTeamsHasCheaters = 0;

    this.playersCount = this.dataService.filteredPlayers.length;
    this.bannedCount = this.playersBanned.length;
    this.bannedPourcentage = this.dataService.getPercentage(this.bannedCount, this.playersCount);

    this.matchesCount = this.dataService.filteredMatches.length;
    const matchWithBans = this.dataService.filteredMatches.filter((m) =>
      this.playersBanned.some((p) => m.playersSteamID64.includes(p.steamID64)),
    );
    this.matchesConcerned = matchWithBans.length || 0;
    this.matchPourcentage = this.dataService.getPercentage(this.matchesConcerned, this.matchesCount);

    this.displayOnlyListOfPlayers = !this.dataService.section;
    if (this.displayOnlyListOfPlayers) {
      this.displayListOfBannedPlayers = true;
    }

    this._calculateUnluckyStats(matchWithBans);

    this._sort();

    this._getFrequencyBans(new Date());
  }

  _getFrequencyBans(now: Date) {
    if (this.playersBanned.length && this.dataService.oldestMatch?.id) {
      const diffInDays = differenceInDays(
        now,
        parse(this.dataService.oldestMatch?.id!, "yyyy-MM-dd HH:mm:ss 'GMT'", now),
      );
      this.frequencyInDaysOfBans = Math.round(diffInDays / this.playersBanned.length);
    }
  }

  _calculateUnluckyStats(matchWithBans: MatchInfo[]) {
    if (this.matchesConcerned > 0) {
      matchWithBans.forEach((match) => {
        const userTeam = match.teamA?.scores?.some((player) => player.steamID64 === this.dataService.mySteamId)
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

      this.matchesAgainstCheatersPercentage = this.dataService.getPercentage(
        this.matchesAgainstCheaters,
        this.matchesConcerned,
      );
      this.matchesWithCheatersPercentage = this.dataService.getPercentage(
        this.matchesWithCheaters,
        this.matchesConcerned,
      );
      this.matchesBothTeamsHasCheatersPercentage = this.dataService.getPercentage(
        this.matchesBothTeamsHasCheaters,
        this.matchesConcerned,
      );

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
