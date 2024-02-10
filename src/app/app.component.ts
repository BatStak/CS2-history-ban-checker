import {
  AfterViewInit,
  ApplicationRef,
  Component,
  HostBinding,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';
import { UtilsService } from '../services/utils.service';

import { CommonModule } from '@angular/common';
import Bowser from 'bowser';
import { Subject, debounceTime } from 'rxjs';
import { Database, MatchFormat } from '../models';
import { ScannerComponent } from './components/ban-scanner/ban-scanner.component';
import { BanStatisticsComponent } from './components/ban-statistics/ban-statistics.component';
import { HistoryLoaderComponent } from './components/history-loader/history-loader.component';
import { OptionsComponent } from './components/options/options.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    OptionsComponent,
    HistoryLoaderComponent,
    ScannerComponent,
    BanStatisticsComponent,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  ready = false;

  isOnGCPDSection = false;

  @HostBinding('class.add-margin')
  get addMarginClass(): boolean {
    return !this.isOnGCPDSection;
  }

  get database(): Database {
    return this._dataService.database;
  }

  private _onDomUpdated = new Subject<void>();

  constructor(
    private _utilsService: UtilsService,
    private _dataService: DataService,
    private _applicationRef: ApplicationRef
  ) {
    // for some reason, change detection does not work in firefox extension
    if (
      Bowser.getParser(window.navigator.userAgent).getBrowserName() ===
      'Firefox'
    ) {
      setInterval(() => this._applicationRef.tick(), 100);
    }
  }

  async ngAfterViewInit() {
    const section =
      new URLSearchParams(document.location.search).get('tab') || undefined;
    this.isOnGCPDSection = !!section;

    let format: MatchFormat | undefined = undefined;
    if (this.isOnGCPDSection) {
      format = MatchFormat.MR12;
      if (section === 'matchhistorywingman') {
        format = MatchFormat.MR8;
      } else if (section === 'matchhistorycompetitive') {
        format = MatchFormat.MR15;
      }
      this._dataService.onReset.subscribe(() => {
        this._update();
      });
    }

    const database = await chrome.storage.local.get();
    this._dataService.init(database, section, format);

    this._update();
    this._onDomUpdated.pipe(debounceTime(250)).subscribe(() => {
      this._update();
    });
    this._observeDomChanges();

    this.ready = true;
  }

  private _observeDomChanges() {
    const results = document.querySelector<HTMLElement>(
      this.isOnGCPDSection
        ? '.csgo_scoreboard_root > tbody'
        : '.friends_content'
    );
    if (results) {
      const observer = new MutationObserver(() => {
        this._onDomUpdated.next();
      });
      observer.observe(results, { childList: true });
    }
  }

  private _update() {
    if (this.isOnGCPDSection) {
      this._utilsService.getHistoryPeriod();
      this._dataService.parseMatches();
      if (this.database.hideHistoryTable) {
        this._dataService.cleanParsedMatches();
      }
    } else {
      this._dataService.parseFriends();
    }
    this._dataService.onSave.next();
  }
}
