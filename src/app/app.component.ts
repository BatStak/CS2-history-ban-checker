import { AfterViewInit, ApplicationRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UtilsService } from '../services/utils.service';
import { DataService } from '../services/data.service';

import { Database, MatchFormat } from '../models';
import { Subject, debounceTime, firstValueFrom } from 'rxjs';
import { CommonModule } from '@angular/common';
import { SteamService } from '../services/steam.service';
import { HistoryLoaderComponent } from './components/history-loader/history-loader.component';
import { ScannerComponent } from './components/ban-scanner/ban-scanner.component';
import { BanStatisticsComponent } from './components/ban-statistics/ban-statistics.component';
import Bowser from 'bowser';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    HistoryLoaderComponent,
    ScannerComponent,
    BanStatisticsComponent,
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

  private _format: MatchFormat;
  private _onDomUpdated = new Subject<void>();

  constructor(
    private _utilsService: UtilsService,
    private _dataService: DataService,
    private _applicationRef: ApplicationRef
  ) {
    const tab = new URLSearchParams(document.location.search).get('tab');
    if (tab === 'matchhistorywingman') {
      this._format = MatchFormat.MR8;
    } else if (tab === 'matchhistorycompetitive') {
      this._format = MatchFormat.MR15;
    } else {
      this._format = MatchFormat.MR12;
    }

    this._dataService.onReset.subscribe(() => {
      this._refreshUI();
    });

    // for some reason, change detection does not work in firefox extension
    if (
      Bowser.getParser(window.navigator.userAgent).getBrowserName() ===
      'Firefox'
    ) {
      setInterval(() => this._applicationRef.tick(), 100);
    }
  }

  async ngAfterViewInit() {
    chrome.storage.local.get((database: any) => {
      this._dataService.init(database); // {} to reinit
      this._dataService.onReady.next();
    });

    await firstValueFrom(this._dataService.onReady);

    this._refreshUI();
    this._onDomUpdated.pipe(debounceTime(250)).subscribe(() => {
      this._refreshUI();
    });
    this._observeNewMatches();
    this.ready = true;
  }

  private _observeNewMatches() {
    const results = document.querySelector('.csgo_scoreboard_root > tbody');
    if (results) {
      const observer = new MutationObserver(() => {
        this._onDomUpdated.next();
      });
      observer.observe(results, { childList: true });
    }
  }

  private _refreshUI() {
    this._dataService.parseMatches(this._format);
    this._utilsService.getHistoryPeriod();
    this._dataService.onSave.next();
  }
}
