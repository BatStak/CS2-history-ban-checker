import { AfterViewInit, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UtilsService } from '../services/utils.service';
import { DataService } from '../services/data.service';

import { Database, MatchFormat } from '../models';
import { Subject, debounceTime, firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  providers: [UtilsService, DataService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  apiKey?: string;
  startDate?: string;
  endDate?: string;
  ready = false;
  showOptions = false;

  get database(): Database {
    return this._dataService.database;
  }

  get isLoading(): boolean {
    return !!this._loadHistoryInterval;
  }

  private _matchesCssSelector =
    '.csgo_scoreboard_root > tbody > tr:not(:first-child)';
  private _loadHistoryInterval?: any;
  private _loadHistoryTimerInMs = 500;
  private _format = MatchFormat.MR24;
  private _pageNumber = 0;

  private _onReady = new Subject<void>();
  private _onRefresh = new Subject<void>();
  private _onSave = new Subject<void>();

  constructor(
    private _dataService: DataService,
    private _utilsService: UtilsService
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
      this._dataService.init(database);
      this._onReady.next();
    });

    await firstValueFrom(this._onReady);

    this.apiKey = this.database.apiKey;

    this._refreshUI();
    this._onRefresh.pipe(debounceTime(250)).subscribe(() => {
      this._refreshUI();
    });
    this._onSave.pipe(debounceTime(2000)).subscribe(() => {
      this._save();
    });
    this._observeNewMatches();
    this.ready = true;
  }

  loadHistory() {
    let historyButtonAttemps = 0;
    const button =
      document.querySelector<HTMLButtonElement>('#load_more_button');
    const next = () => {
      if (button && button.offsetParent !== null) {
        historyButtonAttemps = 0;
        button.click();
      } else {
        historyButtonAttemps++;
        if (historyButtonAttemps > 5) {
          this.stopLoadHistory();
        }
      }
    };
    next();
    this._loadHistoryInterval = setInterval(next, this._loadHistoryTimerInMs);
  }

  stopLoadHistory() {
    clearInterval(this._loadHistoryInterval);
    this._loadHistoryInterval = undefined;
  }

  closeOptions() {
    this.showOptions = false;
    this.database.apiKey = this.apiKey;
    this._save();
  }

  scan() {
    const players = this.database.players?.slice(this._pageNumber * 100, 100);
    if (players?.length) {
      const steamIds = players.map((p) => p.steamID64);
      fetch(
        `https://api.steampowered.com/ISteamUser/GetPlayerBans/v1/?key=${
          this.database.apiKey
        }&steamids=${steamIds.join(',')}`
      )
        .then((res) => {
          if (res.ok) {
            return res.json();
          } else {
            throw Error(`Code ${res.status}. ${res.statusText}`);
          }
        })
        .then((data) => console.log(data))
        .catch((error) => console.error(error));
    }
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
    this._getHistoryPeriod();
    this._onSave.next();
  }

  private _save() {
    chrome.storage.local.set(this.database);
  }

  private _parseMatches() {
    const matches = document.querySelectorAll<HTMLElement>(
      `${this._matchesCssSelector}:not(.parsed)`
    );
    matches.forEach((match) => {
      this._dataService.parseMatch(match, this._format);
    });
  }

  private _getHistoryPeriod() {
    const matches = document.querySelectorAll<HTMLElement>(
      this._matchesCssSelector
    );
    if (matches.length) {
      this.endDate = this._utilsService.getDateOfMatch(matches[0]);
      this.startDate = this._utilsService.getDateOfMatch(
        matches[matches.length - 1]
      );
    }
  }
}
