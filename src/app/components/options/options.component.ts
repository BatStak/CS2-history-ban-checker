import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../../../services/data.service';
import { UtilsService } from '../../../services/utils.service';

@Component({
    selector: 'cs2-history-options',
    imports: [CommonModule, FormsModule],
    templateUrl: './options.component.html',
    styleUrl: './options.component.scss'
})
export class OptionsComponent {
    readonly utilsService = inject(UtilsService);
    readonly dataService = inject(DataService);

    apiKey?: string;

    showOptions = false;
    displayDisclaimer = false;
    displayMoreOptions = false;

    get isLoadingHistory(): boolean {
        return this.utilsService.isLoadingHistory;
    }

    get isScanning(): boolean {
        return this.utilsService.isScanning;
    }

    constructor() {
        this.apiKey = this.dataService.database.apiKey;
    }

    openOptions() {
        this.showOptions = true;
    }

    closeOptions() {
        this.showOptions = this.displayDisclaimer = this.displayMoreOptions = false;
        this.dataService.database.apiKey = this.apiKey;
        this.dataService.save();
    }

    toggleDisclaimer() {
        this.displayDisclaimer = !this.displayDisclaimer;
    }

    resetDatabase() {
        if (window.confirm('Do you really want to reset the database ?')) {
            this.dataService.reset();
        }
    }
}
