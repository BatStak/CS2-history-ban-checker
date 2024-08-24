import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { debounceTime } from 'rxjs';
import { DataService, WinrateData as MapData } from '../../../services/data.service';

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

  async toggle() {
    this.display = !this.display;
    if (this.display && !this.mapDatas.length) {
      this._update();
    }
  }

  private async _update() {
    this.mapDatas = await this._dataService.getMapDatas();
  }
}
