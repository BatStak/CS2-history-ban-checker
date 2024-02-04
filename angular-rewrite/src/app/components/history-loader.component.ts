import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  booleanAttribute,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Database } from '../../models';
import { DataService } from '../../services/data.service';
import { UtilsService } from '../../services/utils.service';

@Component({
  selector: 'history-loader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './history-loader.component.html',
  styleUrl: './history-loader.component.scss',
})
export class HistoryLoaderComponent implements OnChanges {
  @Input({ transform: booleanAttribute }) ready = false;
  @Input({ transform: booleanAttribute }) isScanning = false;
  @Input() apiKey?: string;

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

  private _loadHistoryInterval?: any;
  private _loadHistoryTimerInMs = 500;

  constructor(
    private _utilsService: UtilsService,
    private _dataService: DataService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (!!changes['ready']) {
      this.apiKey = this._dataService.database.apiKey;
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

  closeOptions() {
    this.showOptions = false;
    this.database.apiKey = this.apiKey;
    this._save();
  }

  private _save() {
    this._dataService.save();
  }
}
