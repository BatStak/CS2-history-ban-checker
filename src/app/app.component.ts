import {
  AfterViewInit,
  ApplicationRef,
  Component,
  DoCheck,
  HostBinding,
  OnDestroy,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';
import { UtilsService } from '../services/utils.service';

import { CommonModule } from '@angular/common';
import Bowser from 'bowser';
import { Subject, Subscription, debounceTime } from 'rxjs';
import { Database, MatchFormat } from '../models';
import { DatabaseService } from '../services/database.service';
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
export class AppComponent implements AfterViewInit, DoCheck, OnDestroy {
  ready = false;

  isOnGCPDSection = false;

  @HostBinding('class.add-margin')
  addMarginClass = false;

  get database(): Database {
    return this._dataService.database;
  }

  _onDomUpdated = new Subject<void>();
  _onDomUpdatedSubscription?: Subscription;
  _onResetSubcription?: Subscription;

  _validTabs = [
    'matchhistorypremier', // premier
    'matchhistorycompetitivepermap', // per map matchmaking (cs2)
    'matchhistorycompetitive', // csgo
    'matchhistorywingman', // wingman
  ];
  _format?: MatchFormat;
  _domCheckDebounceTimeInMs = 250;

  constructor(
    public _databaseService: DatabaseService,
    public _utilsService: UtilsService,
    public _dataService: DataService,
    public _applicationRef: ApplicationRef
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

    this.isOnGCPDSection = !!section && this._validTabs.includes(section);
    if (this.isOnGCPDSection) {
      if (section === 'matchhistorywingman') {
        this._format = MatchFormat.MR8;
      } else if (section === 'matchhistorycompetitive') {
        this._format = MatchFormat.MR15;
      } else {
        this._format = MatchFormat.MR12;
      }
      this._onResetSubcription = this._dataService.onReset.subscribe(() => {
        this._update();
      });
    }

    const database = await this._databaseService.getDatabase();
    this._dataService.init(database, section, this._format);

    this._update();
    this._onDomUpdatedSubscription = this._onDomUpdated
      .pipe(debounceTime(this._domCheckDebounceTimeInMs))
      .subscribe(() => {
        this._update();
      });
    this._observeDomChanges();

    this.ready = true;
  }

  ngDoCheck(): void {
    this.addMarginClass = !this.isOnGCPDSection;
  }

  ngOnDestroy(): void {
    this._onDomUpdatedSubscription?.unsubscribe();
    this._onResetSubcription?.unsubscribe();
  }

  _observeDomChanges() {
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

  _update() {
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
