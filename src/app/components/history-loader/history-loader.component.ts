import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Database } from '../../../models';
import { DataService } from '../../../services/data.service';
import { UtilsService } from '../../../services/utils.service';

@Component({
  selector: 'cs2-history-loader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history-loader.component.html',
  styleUrl: './history-loader.component.scss',
})
export class HistoryLoaderComponent {
  apiKey?: string;
  hideHistoryTable?: boolean;

  showOptions = false;

  get database(): Database {
    return this._dataService.database;
  }

  get startDate(): string | undefined {
    return this._utilsService.startDate;
  }

  get endDate(): string | undefined {
    return this._utilsService.endDate;
  }

  get isLoadingHistory(): boolean {
    return this._utilsService.isLoadingHistory;
  }

  get isScanning(): boolean {
    return this._utilsService.isScanning;
  }

  private _loadHistoryInterval?: any;
  private _loadHistoryTimerInMs = 500;

  constructor(
    private _utilsService: UtilsService,
    private _dataService: DataService
  ) {
    this.apiKey = this._dataService.database.apiKey;
    this.hideHistoryTable = this._dataService.database.hideHistoryTable;
  }

  toggleHideHistoryTable(event: Event) {
    if (event?.target) {
      this.hideHistoryTable = (event.target as HTMLInputElement).checked;
      if (this._dataService.database) {
        this._dataService.database.hideHistoryTable = this.hideHistoryTable;
        this._dataService.save();
        if (this.hideHistoryTable) {
          this._dataService.cleanParsedMatches();
        }
      }
    }
  }

  loadHistory() {
    this._utilsService.isLoadingHistory = true;
    let historyButtonAttemps = 0;
    const button =
      document.querySelector<HTMLButtonElement>('#load_more_button');
    const next = () => {
      if (button && button.offsetParent !== null) {
        historyButtonAttemps = 0;
        button.click();
      } else {
        historyButtonAttemps++;
        if (historyButtonAttemps > 5) {
          this.stopLoadHistory();
        }
      }
    };
    next();
    this._loadHistoryInterval = setInterval(next, this._loadHistoryTimerInMs);
  }

  stopLoadHistory() {
    clearInterval(this._loadHistoryInterval);
    this._utilsService.isLoadingHistory = false;
  }

  openOptions() {
    this.showOptions = true;
  }

  closeOptions() {
    this.showOptions = false;
    this.database.apiKey = this.apiKey;
    this._dataService.save();
  }

  resetDatabase() {
    this._dataService.reset();
  }
}
