import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UtilsService } from '../services/utils.service';
import { DataService } from '../services/data.service';

import { BanInfo, Database, MatchFormat, PlayerInfo } from '../models';
import { Subject, debounceTime, firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SteamService } from '../services/steam.service';
import { HistoryLoaderComponent } from './components/history-loader.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule, HistoryLoaderComponent],
  providers: [UtilsService, DataService, SteamService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  ready = false;
  error = '';
  isScanning = false;

  get database(): Database {
    return this._dataService.database;
  }
  get isLoadingHistory(): boolean {
    return this._utilsService.isLoadingHistory;
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
  get playersBanned(): PlayerInfo[] {
    return this._dataService.playersBanned;
  }

  private _format = MatchFormat.MR24;
  private _pageNumber = 0;
  private _stopScan = false;
  private _onRefresh = new Subject<void>();

  constructor(
    private _utilsService: UtilsService,
    private _dataService: DataService,
    private _steamService: SteamService
  ) {
    if (
      new URLSearchParams(document.location.search).get('tab') ===
      'matchhistorywingman'
    ) {
      this._format = MatchFormat.MR16;
    }
  }

  async ngAfterViewInit() {
    chrome.storage.local.get((database: any) => {
      this._dataService.init(database); // {} to reinit
      this._dataService.onReady.next();
    });

    await firstValueFrom(this._dataService.onReady);

    this._refreshUI();
    this._onRefresh.pipe(debounceTime(250)).subscribe(() => {
      this._refreshUI();
    });
    this._dataService.onSave.pipe(debounceTime(2000)).subscribe(() => {
      this._save();
    });
    this._observeNewMatches();
    this.ready = true;
  }

  async scanPlayers() {
    const stop = () => {
      this.isScanning = this._stopScan = false;
      this._pageNumber = 0;
    };
    this.isScanning = true;
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

  private _observeNewMatches() {
    const results = document.querySelector('.csgo_scoreboard_root > tbody');
    if (results) {
      const observer = new MutationObserver(() => {
        this._onRefresh.next();
      });
      observer.observe(results, { childList: true });
    }
  }

  private _refreshUI() {
    this._parseMatches();
    this._utilsService.getHistoryPeriod();
    this._dataService.onSave.next();
  }

  private _save() {
    this._dataService.save();
  }

  private _parseMatches() {
    const matches = document.querySelectorAll<HTMLElement>(
      `${this._utilsService.matchesCssSelector}:not(.parsed)`
    );
    matches.forEach((match) => {
      this._dataService.parseMatch(match, this._format);
    });
  }
}
