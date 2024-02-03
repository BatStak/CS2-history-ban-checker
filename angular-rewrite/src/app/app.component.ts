import { AfterViewInit, ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UtilsService } from '../services/utils.service';

import { Database } from '../models';
import { Subject, firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [FormsModule],
  providers: [UtilsService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  loadHistoryInterval?: any;
  loadHistoryTimerInMs = 500;

  startDate?: string;
  endDate?: string;

  showOptions = false;

  apiKey?: string;
  database: Database = {};

  loaded = false;

  get hasKey(): boolean {
    return !!this.database?.apiKey;
  }

  private _matchesCssSelector =
    '.csgo_scoreboard_root > tbody > tr:not(:first-child)';

  private _ready = new Subject<void>();

  constructor(private _utilsService: UtilsService) {}

  async ngAfterViewInit() {
    chrome.storage.sync.get((cshistorydb: any) => {
      this.database = cshistorydb;
      this._ready.next();
    });

    await firstValueFrom(this._ready);

    this.database ??= {};
    this.database.matches ??= [];
    this.database.players ??= [];
    this.apiKey = this.database.apiKey;

    this.loaded = true;
    this._observeNewMatches();
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
    this.loadHistoryInterval = setInterval(next, this.loadHistoryTimerInMs);
  }

  stopLoadHistory() {
    clearInterval(this.loadHistoryInterval);
    this.loadHistoryInterval = undefined;
  }

  closeOptions() {
    this.showOptions = false;
    this.database.apiKey = this.apiKey;
    chrome.storage.sync.set(this.database);
  }

  private _observeNewMatches() {
    const results = document.querySelector('.csgo_scoreboard_root > tbody');
    if (results) {
      const observer = new MutationObserver(() => {
        this._parseMatches();
        this._getHistoryPeriod();
      });
      observer.observe(results, { childList: true });
    }
  }

  private _parseMatches() {
    const matches = document.querySelectorAll<HTMLElement>(
      `${this._matchesCssSelector}:not(.parsed)`
    );
    matches.forEach((match) => {
      const matchId = this._utilsService.getDateOfMatch(match);

      // ajout d'un nouveau match dans la bdd
      if (matchId && !this.database.matches?.some((m) => m.id === matchId)) {
        this.database.matches!.push({
          id: matchId,
          map: this._utilsService.getMap(match),
          replayLink: this._utilsService.getReplayLink(match),
          playersSteamID64: [],
        });
      }

      const matchInfo = this.database.matches?.find((m) => m.id === matchId);

      const players = match.querySelectorAll(
        '.csgo_scoreboard_inner_right > tbody > tr'
      );

      players.forEach((player, index) => {
        // not the score
        if (player.children.length > 1) {
          const lastColumn = player.children[player.children.length - 1];
          lastColumn.after(lastColumn.cloneNode(true));
          const newColumn = player.children[player.children.length - 1];
          if (index === 0) {
            newColumn.textContent = 'Ban?';
          } else {
            newColumn.textContent = '-';
          }
        }
      });

      match.classList.add('parsed');
    });
  }

  private _getHistoryPeriod() {
    const matches = document.querySelectorAll<HTMLElement>(
      this._matchesCssSelector
    );
    if (matches.length) {
      this.endDate = this._utilsService
        .getDateOfMatch(matches[0])
        ?.substring(0, 10);
      this.startDate = this._utilsService
        .getDateOfMatch(matches[matches.length - 1])
        ?.substring(0, 10);
    }
  }
}
