import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { debounceTime } from 'rxjs';
import { DataService, WinrateData as MapData } from '../../../services/data.service';

type columnType = 'map' | 'sampleSize' | 'banrate' | 'winrate';

@Component({
  selector: 'map-datas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map-datas.component.html',
  styleUrl: './map-datas.component.scss',
})
export class MapDatasComponent implements OnInit {
  _dataService = inject(DataService);

  display = false;
  mapDatas: MapData[] = [];

  order = 'asc';
  column: columnType = 'map';

  get mySteamId(): string | undefined {
    return this._dataService.mySteamId;
  }

  async ngOnInit() {
    this._dataService.onSave.pipe(debounceTime(500)).subscribe(() => {
      if (this.display) {
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
    this.mapDatas = await this._dataService.getMapDatas();
    this._sort();
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
