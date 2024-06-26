import { CommonModule } from '@angular/common';
import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { PlayerInfo } from '../../../models';
import { DataService } from '../../../services/data.service';

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

  _update() {
    this.playersCount = this._dataService.filteredPlayers.length;
    this.bannedCount = this.playersBanned.length;
    this.bannedPourcentage = this.playersCount ? Math.round((this.bannedCount / this.playersCount) * 10000) / 100 : 0;

    this.matchesCount = this._dataService.filteredMatches.length;
    const filteredMatches = this._dataService.filteredMatches.filter((m) =>
      this.playersBanned.some((p) => m.playersSteamID64.includes(p.steamID64))
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
}
