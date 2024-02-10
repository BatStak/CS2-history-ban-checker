import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
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
  hideHistoryTable?: boolean;

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

  private _loadHistoryTimer?: any;
  private _loadHistoryInternvalInMs = 800;

  constructor(
    private _utilsService: UtilsService,
    private _dataService: DataService
  ) {
    this.hideHistoryTable = this._dataService.database.hideHistoryTable;
  }

  startLoadHistory() {
    this._utilsService.isLoadingHistory = true;
    let buttonClickAttemps = 0;
    const loadMoreButton =
      document.querySelector<HTMLButtonElement>('#load_more_button');
    const handleTick = () => {
      if (loadMoreButton && loadMoreButton.offsetParent !== null) {
        buttonClickAttemps = 0;
        loadMoreButton.click();
      } else {
        buttonClickAttemps++;
        if (buttonClickAttemps > 5) {
          this.stopLoadHistory();
        }
      }
    };
    handleTick();
    this._loadHistoryTimer = setInterval(
      handleTick,
      this._loadHistoryInternvalInMs
    );
  }

  stopLoadHistory() {
    clearInterval(this._loadHistoryTimer);
    this._utilsService.isLoadingHistory = false;
  }

  toggleHideCleanMatches(event: Event) {
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
}
