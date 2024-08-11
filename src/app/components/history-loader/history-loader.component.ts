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
  displayReloadWarning = false;

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

  _loadHistoryTimer?: any;
  _loadHistoryInternvalInMs = 800;
  _buttonClickAttempts = 0;
  _buttonClickMaxAttempts = 5;
  _loadMoreButton?: HTMLButtonElement | null;

  _loadMoreButtonCssSelector = '#load_more_button';

  constructor(
    public _utilsService: UtilsService,
    public _dataService: DataService,
  ) {
    this.hideHistoryTable = this._dataService.database.hideHistoryTable;
    this._loadMoreButton = document.querySelector<HTMLButtonElement>(this._loadMoreButtonCssSelector);
  }

  startLoadHistory() {
    this._utilsService.isLoadingHistory = true;
    this._buttonClickAttempts = 0;

    this._clickOnMoreButton();
    this._loadHistoryTimer = setInterval(() => this._clickOnMoreButton(), this._loadHistoryInternvalInMs);
  }

  stopLoadHistory() {
    clearInterval(this._loadHistoryTimer);
    this._loadHistoryTimer = undefined;
    this._utilsService.isLoadingHistory = false;
  }

  async toggleHideCleanMatches(event: Event) {
    if (event?.target) {
      this.hideHistoryTable = (event.target as HTMLInputElement).checked;
      this._dataService.database.hideHistoryTable = this.hideHistoryTable;
      await this._dataService.save();
      this.displayReloadWarning = !this.hideHistoryTable;
      if (this.hideHistoryTable) {
        this._dataService.cleanParsedMatches();
      }
    }
  }

  _clickOnMoreButton() {
    if (this._loadMoreButton && this._loadMoreButton.offsetParent !== null) {
      this._buttonClickAttempts = 0;
      this._loadMoreButton.click();
    } else {
      this._buttonClickAttempts++;
      if (this._buttonClickAttempts >= this._buttonClickMaxAttempts) {
        this.stopLoadHistory();
      }
    }
  }
}
