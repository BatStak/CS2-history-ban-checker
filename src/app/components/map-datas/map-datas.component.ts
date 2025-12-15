import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { DataService, WinrateData as MapData } from '../../../services/data.service';

type columnType = 'map' | 'sampleSize' | 'banrate' | 'winrate';

@Component({
  selector: 'map-datas',
  imports: [CommonModule],
  templateUrl: './map-datas.component.html',
  styleUrl: './map-datas.component.scss',
})
export class MapDatasComponent implements OnInit {
  _dataService = inject(DataService);

  winRateUpdated = new Subject<Event>();

  display = false;
  mapDatas: MapData[] = [];

  order = 'asc';
  column: columnType = 'map';

  lastMapsSamplesize = 30;
  lastMapsRealSamplesize = 30;
  lastMapsPercentage = 0;
  lastMapsWinCounts = 0;

  get mySteamId(): string | undefined {
    return this._dataService.mySteamId;
  }

  async ngOnInit() {
    this._dataService.onSave.pipe(debounceTime(500)).subscribe(() => {
      if (this.display) {
        this._update();
      }
    });

    this.winRateUpdated.pipe(debounceTime(500)).subscribe((event: Event) => {
      if (this.display) {
        this.lastMapsSamplesize = (event.target as HTMLInputElement).valueAsNumber;
        this._update();
      }
    });
  }

  orderBy(column: columnType) {
    if (this.column === column) {
      this.order = this.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.order = 'asc';
    }
    this.column = column;

    this._sort();
  }

  async toggle() {
    this.display = !this.display;
    if (this.display && !this.mapDatas.length) {
      this._update();
    }
  }

  private async _update() {
    this.mapDatas = await this._dataService.getMapDatas(this.lastMapsSamplesize);
    this._sort();
    const allMapsData = this.mapDatas.find((a) => a.map === 'All maps')!;
    this.lastMapsWinCounts = allMapsData.mostRecentWinsCount || 0;
    this.lastMapsRealSamplesize = Math.min(this.lastMapsSamplesize, allMapsData.sampleSize);
    this.lastMapsPercentage = Math.round((this.lastMapsWinCounts / this.lastMapsRealSamplesize) * 10000) / 100;
  }

  private _sort() {
    this.mapDatas.sort((a, b) => {
      if (a[this.column] === undefined || b[this.column] === undefined || a[this.column] === b[this.column]) {
        return a.map < b.map ? (this.order === 'asc' ? -1 : 1) : this.order === 'asc' ? 1 : -1;
      }
      return a[this.column]! < b[this.column]! ? (this.order === 'asc' ? -1 : 1) : this.order === 'asc' ? 1 : -1;
    });
  }
}
