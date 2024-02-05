import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { DataService } from '../../../services/data.service';
import { UtilsService } from '../../../services/utils.service';
import { BanInfo, Database, MatchInfo } from '../../../models';
import { SteamService } from '../../../services/steam.service';

@Component({
  selector: 'scanner',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scanner.component.html',
  styleUrl: './scanner.component.scss',
})
export class ScannerComponent {
  error = '';

  get isLoadingHistory(): boolean {
    return this._utilsService.isLoadingHistory;
  }

  get isScanning(): boolean {
    return this._utilsService.isScanning;
  }

  get database(): Database {
    return this._dataService.database;
  }

  get hasPeopleNotScannedYet(): boolean {
    return this._dataService.hasPeopleNotScannedYet;
  }

  get oldestScan(): BanInfo | undefined {
    return this._dataService.oldestScan;
  }

  get mostRecentScan(): BanInfo | undefined {
    return this._dataService.mostRecentScan;
  }

  get oldestMatch(): MatchInfo | undefined {
    return this._dataService.oldestMatch;
  }

  private _pageNumber = 0;
  private _stopScan = false;

  constructor(
    private _utilsService: UtilsService,
    private _dataService: DataService,
    private _steamService: SteamService
  ) {}

  async scanPlayers() {
    const stop = () => {
      this._utilsService.isScanning = this._stopScan = false;
      this._pageNumber = 0;
      this._dataService.onSave.next();
    };
    this._utilsService.isScanning = true;
    const startIndex = this._pageNumber * 100;
    const players = this.database.players?.slice(startIndex, startIndex + 100);
    if (players?.length) {
      const steamIds = players.map((p) => p.steamID64);
      try {
        const results = await this._steamService.scanPlayers(steamIds);
        this._dataService.parseSteamResults(results);

        this.error = '';
        if (this._stopScan) {
          stop();
        } else {
          this._pageNumber++;
          setTimeout(() => this.scanPlayers(), 500);
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
}
