import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UtilsService } from '../services/utils.service';
import { DataService } from '../services/data.service';

import { Database, MatchFormat, PlayerInfo } from '../models';
import { Subject, debounceTime, firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SteamService } from '../services/steam.service';
import { HistoryLoaderComponent } from './components/history-loader.component';
import { ScannerComponent } from './components/scanner.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HistoryLoaderComponent,
    ScannerComponent,
  ],
  providers: [UtilsService, DataService, SteamService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  ready = false;

  get database(): Database {
    return this._dataService.database;
  }

  get playersBanned(): PlayerInfo[] {
    return this._dataService.playersBanned;
  }

  private _format = MatchFormat.MR24;
  private _onRefresh = new Subject<void>();

  constructor(
    private _utilsService: UtilsService,
    private _dataService: DataService
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
    this._observeNewMatches();
    this.ready = true;
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

  private _parseMatches() {
    const matches = document.querySelectorAll<HTMLElement>(
      `${this._utilsService.matchesCssSelector}:not(.parsed)`
    );
    matches.forEach((match) => {
      this._dataService.parseMatch(match, this._format);
    });
  }
}
