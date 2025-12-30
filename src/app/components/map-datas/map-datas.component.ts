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
  dataService = inject(DataService);

  winRateUpdated = new Subject<Event>();

  display = false;
  mapDatas: MapData[] = [];

  order = 'asc';
  column: columnType = 'map';

  recentMapsSamplesize = 30;
  recentMapsRealSamplesize = 30;
  recentMapsPercentage = 0;
  recentMapsWinCount = 0;

  recentSoloQPercentage = 0;
  recentSoloQCount = 0;
  soloQCount = 0;
  soloQPercentage = 0;

  allMapsSampleSize = 0;

  hasFriends = false;

  get mySteamId(): string | undefined {
    return this.dataService.mySteamId;
  }

  async ngOnInit() {
    this.dataService.onSave.pipe(debounceTime(500)).subscribe(() => {
      if (this.display) {
        this._update();
      }
    });

    this.winRateUpdated.pipe(debounceTime(500)).subscribe((event: Event) => {
      if (this.display) {
        this.recentMapsSamplesize = (event.target as HTMLInputElement).valueAsNumber;
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
    this.hasFriends = this.dataService.hasFriends();
    this.mapDatas = await this.dataService.getMapDatas(this.recentMapsSamplesize);
    this._sort();
    const allMapsData = this.mapDatas.find((a) => a.map === 'All maps')!;

    this.recentMapsRealSamplesize = Math.min(this.recentMapsSamplesize, allMapsData.sampleSize);

    this.allMapsSampleSize = allMapsData.sampleSize;
    this.recentMapsWinCount = allMapsData.mostRecentWinsCount || 0;
    this.recentMapsPercentage = this.dataService.getPercentage(this.recentMapsWinCount, this.recentMapsRealSamplesize);

    this.recentSoloQCount = allMapsData.recentSoloQCount || 0;
    this.recentSoloQPercentage = this.dataService.getPercentage(this.recentSoloQCount, this.recentMapsRealSamplesize);
    this.soloQCount = allMapsData.soloQCount || 0;
    this.soloQPercentage = this.dataService.getPercentage(this.soloQCount, this.allMapsSampleSize);
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
