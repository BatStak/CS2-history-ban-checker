import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { UtilsService } from '../../../services/utils.service';
import { BanInfo, Database, MatchInfo, PlayerInfo } from '../../../models';
import { SteamService } from '../../../services/steam.service';

@Component({
  selector: 'scanner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ban-scanner.component.html',
  styleUrl: './ban-scanner.component.scss',
})
export class ScannerComponent {
  error = '';

  get isLoadingHistory(): boolean {
    return this._utilsService.isLoadingHistory;
  }

  get isScanning(): boolean {
    return this._utilsService.isScanning;
  }

  get matches(): MatchInfo[] | undefined {
    return this._dataService.matches;
  }

  get players(): PlayerInfo[] | undefined {
    return this._dataService.players;
  }

  get playersNotScannedYet(): PlayerInfo[] | undefined {
    return this._dataService.playersNotScannedYet;
  }

  get oldestScan(): BanInfo | undefined {
    return this._dataService.oldestScan;
  }

  get oldestMatch(): MatchInfo | undefined {
    return this._dataService.oldestMatch;
  }

  numberOfPages = 0;
  pageNumber = 0;

  private _stopScan = false;

  constructor(
    private _utilsService: UtilsService,
    private _dataService: DataService,
    private _steamService: SteamService
  ) {}

  startScan(type: 'new' | 'all') {
    if (this.players) {
      const players =
        type === 'new'
          ? this.players.filter((p) => !p.banInfo?.LastFetch)
          : this.players;

      this.numberOfPages =
        Math.floor(players.length / 100) + (players.length % 100 !== 0 ? 1 : 0);

      this.scanPlayers(players);
    }
  }

  async scanPlayers(players: PlayerInfo[]) {
    const stop = () => {
      this._utilsService.isScanning = this._stopScan = false;
      this.pageNumber = this.numberOfPages = 0;
      this._dataService.onSave.next();
    };

    this._utilsService.isScanning = true;
    const startIndex = this.pageNumber * 100;
    const scannedPlayers = players.slice(startIndex, startIndex + 100);
    if (scannedPlayers.length) {
      const steamIds = scannedPlayers.map((p) => p.steamID64);
      try {
        const results = await this._steamService.scanPlayers(steamIds);
        this._handleDeletedProfiles(results, steamIds);

        this._dataService.parseSteamResults(results);

        this.error = '';
        if (this._stopScan) {
          stop();
        } else {
          this.pageNumber++;
          if (this.pageNumber >= this.numberOfPages) {
            stop();
          } else {
            setTimeout(() => this.scanPlayers(players), 500);
          }
        }
      } catch (e) {
        this.error = 'Error while trying to scan ban status of players';
        console.error(e);
        stop();
      }
    } else {
      stop();
    }
  }

  stopScan() {
    this._stopScan = true;
  }

  private _handleDeletedProfiles(results: BanInfo[], steamIds: string[]) {
    let allPlayers = this._dataService.database.players;
    if (allPlayers) {
      const deletedPlayers = allPlayers.filter(
        (p) =>
          steamIds.includes(p.steamID64) &&
          !results.some((r) => r.SteamId === p.steamID64)
      );
      for (const deleted of deletedPlayers) {
        const index = allPlayers.findIndex(
          (p) => p.steamID64 === deleted.steamID64
        );
        if (index >= 0) {
          allPlayers.splice(index, 1);
        }
      }
    }
  }
}
