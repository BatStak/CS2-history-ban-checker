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
  playersCount = 0;
  bannedCount = 0;
  bannedPourcentage = 0;

  matchesCount = 0;
  matchesConcerned = 0;
  matchPourcentage = 0;

  get playersBannedAfter(): PlayerInfo[] {
    return this._dataService.playersBannedAfter;
  }

  _onStatisticsUpdatedSubscription?: Subscription;

  constructor(public _dataService: DataService) {
    this._onStatisticsUpdatedSubscription =
      this._dataService.onStatisticsUpdated.subscribe(() => {
        this._update();
      });

    this._update();
  }

  ngOnDestroy(): void {
    this._onStatisticsUpdatedSubscription?.unsubscribe();
  }

  _update() {
    this.playersCount = this._dataService.players.length;
    this.bannedCount = this.playersBannedAfter.length;
    this.bannedPourcentage =
      Math.round((this.bannedCount / this.playersCount) * 10000) / 100;

    this.matchesCount = this._dataService.matches.length;
    const filteredMatches = this._dataService.matches.filter((m) =>
      this._dataService.playersBannedAfter.some((p) =>
        m.playersSteamID64.includes(p.steamID64)
      )
    );
    this.matchesConcerned = filteredMatches.length || 0;
    this.matchPourcentage =
      Math.round((this.matchesConcerned / this.matchesCount) * 10000) / 100;
  }
}
