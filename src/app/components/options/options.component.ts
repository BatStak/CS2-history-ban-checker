import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'cs2-history-options',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './options.component.html',
  styleUrl: './options.component.scss',
})
export class OptionsComponent {
  _utilsService = inject(UtilsService);
  _dataService = inject(DataService);

  apiKey?: string;

  showOptions = false;
  displayDisclaimer = false;
  displayMoreOptions = false;

  get isLoadingHistory(): boolean {
    return this._utilsService.isLoadingHistory;
  }

  get isScanning(): boolean {
    return this._utilsService.isScanning;
  }

  constructor() {
    this.apiKey = this._dataService.database.apiKey;
  }

  openOptions() {
    this.showOptions = true;
  }

  closeOptions() {
    this.showOptions = this.displayDisclaimer = this.displayMoreOptions = false;
    this._dataService.database.apiKey = this.apiKey;
    this._dataService.save();
  }

  toggleDisclaimer() {
    this.displayDisclaimer = !this.displayDisclaimer;
  }

  resetDatabase() {
    if (window.confirm('Do you really want to reset the database ?')) {
      this._dataService.reset();
    }
  }
}
