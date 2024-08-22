import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { DataService, WinrateData } from '../../../services/data.service';

@Component({
  selector: 'winrate',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './winrate.component.html',
  styleUrl: './winrate.component.scss',
})
export class WinrateComponent implements OnInit {
  display = false;
  winrateDatas: WinrateData[] = [];

  get mySteamId(): string | undefined {
    return this._dataService.mySteamId;
  }

  constructor(private _dataService: DataService) {}

  async ngOnInit() {
    this._dataService.onStatisticsUpdated.subscribe(async () => {
      if (this.display) {
        this._update();
      }
    });
  }

  async toggle() {
    this.display = !this.display;
    if (this.display && !this.winrateDatas.length) {
      this._update();
    }
  }

  private async _update() {
    this.winrateDatas = await this._dataService.getWinrates();
  }
}
