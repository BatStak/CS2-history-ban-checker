import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { PlayerInfo } from '../../../models';
import { DataService } from '../../../services/data.service';

@Component({
  selector: 'ban-statistics',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ban-statistics.component.html',
  styleUrl: './ban-statistics.component.scss',
})
export class BanStatisticsComponent {
  get playersBanned(): PlayerInfo[] {
    return this._dataService.playersBanned;
  }

  constructor(private _dataService: DataService) {}
}
