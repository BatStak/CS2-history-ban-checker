import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { UtilsService } from '../../../services/utils.service';

@Component({
    selector: 'cs2-history-loader',
    imports: [CommonModule, FormsModule],
    templateUrl: './history-loader.component.html',
    styleUrl: './history-loader.component.scss',
})
export class HistoryLoaderComponent {
    readonly utilsService = inject(UtilsService);
    readonly dataService = inject(DataService);
    readonly appRef = inject(ChangeDetectorRef);

    hideHistoryTable?: boolean;

    get startDate(): string | undefined {
        return this.utilsService.startDate;
    }

    get endDate(): string | undefined {
        return this.utilsService.endDate;
    }

    get isLoadingHistory(): boolean {
        return this.utilsService.isLoadingHistory;
    }

    get isScanning(): boolean {
        return this.utilsService.isScanning;
    }

    loadHistoryTimer?: any;
    loadHistoryInternvalInMs = 800;
    buttonClickAttempts = 0;
    buttonClickMaxAttempts = 10;
    loadMoreButton?: HTMLButtonElement | null;

    loadMoreButtonCssSelector = '#load_more_button';

    constructor() {
        this.hideHistoryTable = this.dataService.database.hideHistoryTable;
        this.loadMoreButton = document.querySelector<HTMLButtonElement>(this.loadMoreButtonCssSelector);
    }

    startLoadHistory() {
        this.utilsService.isLoadingHistory = true;
        this.buttonClickAttempts = 0;

        this.clickOnMoreButton();
        this.loadHistoryTimer = setInterval(() => this.clickOnMoreButton(), this.loadHistoryInternvalInMs);
    }

    stopLoadHistory() {
        clearInterval(this.loadHistoryTimer);
        this.loadHistoryTimer = undefined;
        this.utilsService.isLoadingHistory = false;
        this.appRef.markForCheck();
    }

    async toggleHideCleanMatches(event: Event) {
        if (event?.target) {
            this.hideHistoryTable = (event.target as HTMLInputElement).checked;
            this.dataService.database.hideHistoryTable = this.hideHistoryTable;
            await this.dataService.save();
            if (this.hideHistoryTable && this.isLoadingHistory) {
                this.dataService.cleanParsedMatches();
            }
        }
    }

    clickOnMoreButton() {
        if (this.loadMoreButton && this.loadMoreButton.offsetParent !== null) {
            this.buttonClickAttempts = 0;
            this.loadMoreButton.click();
        } else {
            this.buttonClickAttempts++;
            if (this.buttonClickAttempts >= this.buttonClickMaxAttempts) {
                this.stopLoadHistory();
            }
        }
    }
}
