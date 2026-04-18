import { CommonModule } from '@angular/common';
import { Component, DoCheck, inject, input } from '@angular/core';
import { BanInfo, MatchInfo, PlayerInfo } from '../../../models';
import { DataService } from '../../../services/data.service';
import { SteamService } from '../../../services/steam.service';
import { UtilsService } from '../../../services/utils.service';

@Component({
    selector: 'cs2-history-ban-scanner',
    imports: [CommonModule],
    templateUrl: './ban-scanner.component.html',
    styleUrl: './ban-scanner.component.scss'
})
export class ScannerComponent implements DoCheck {
    readonly utilsService = inject(UtilsService);
    readonly dataService = inject(DataService);
    readonly steamService = inject(SteamService);

    error = '';

    get isLoadingHistory(): boolean {
        return this.utilsService.isLoadingHistory;
    }

    get isScanning(): boolean {
        return this.utilsService.isScanning;
    }

    get matches(): MatchInfo[] {
        return this.dataService.filteredMatches;
    }

    get players(): PlayerInfo[] {
        return this.dataService.filteredPlayers;
    }

    get playersNotScannedYet(): PlayerInfo[] {
        return this.dataService.playersNotScannedYet;
    }

    get oldestScan(): BanInfo | undefined {
        return this.dataService.oldestScan;
    }

    get oldestMatch(): MatchInfo | undefined {
        return this.dataService.oldestMatch;
    }

    showListBannedChangedWarning?: boolean;
    numberOfPages = 0;
    pageNumber = 0;

    delayBetweenSteamCallInMs = 500;
    scanStopped = false;

    ngDoCheck(): void {
        this.showListBannedChangedWarning = this.dataService.listPlayersBannedChanged;
    }

    startScan(type: 'new' | 'all') {
        const players = type === 'new' ? this.players.filter((p) => !p.banInfo?.LastFetch) : this.players;

        this.calcNumberOfPages(players);
        this.scanPlayers(players);
    }

    stopScan() {
        this.scanStopped = true;
    }

    calcNumberOfPages(players: PlayerInfo[]) {
        this.numberOfPages = Math.floor(players.length / 100) + (players.length % 100 !== 0 ? 1 : 0);
    }

    async scanPlayers(players: PlayerInfo[]) {
        this.utilsService.isScanning = true;
        const startIndex = this.pageNumber * 100;
        const scannedPlayers = players.slice(startIndex, startIndex + 100);
        if (scannedPlayers.length) {
            const steamIds = scannedPlayers.map((p) => p.steamID64);
            try {
                const results = await this.steamService.scanPlayers(steamIds);
                this.handleDeletedProfiles(results, steamIds);

                this.dataService.parseSteamResults(results);

                this.error = '';
                if (this.scanStopped) {
                    this.stopScanning();
                } else {
                    this.pageNumber++;
                    if (this.pageNumber >= this.numberOfPages) {
                        this.stopScanning();
                    } else {
                        await this.utilsService.wait(this.delayBetweenSteamCallInMs);
                        this.scanPlayers(players);
                    }
                }
            } catch (e) {
                this.error = 'Error while trying to scan ban status of players';
                console.error(e);
                this.stopScanning();
            }
        } else {
            this.stopScanning();
        }
    }

    stopScanning() {
        this.utilsService.isScanning = this.scanStopped = false;
        this.pageNumber = this.numberOfPages = 0;
        this.dataService.save();
    }

    /**
     * If steam API does not return the players, it is because steam profiles have been deleted
     * @param steamApiResults the results from steam API
     * @param steamIdsScanned the steam IDs we send
     */
    handleDeletedProfiles(steamApiResults: BanInfo[], steamIdsScanned: string[]) {
        let allPlayers = this.dataService.database.players;
        const deletedPlayers = allPlayers.filter(
            (p) => steamIdsScanned.includes(p.steamID64) && !steamApiResults.some((r) => r.SteamId === p.steamID64),
        );
        for (const deleted of deletedPlayers) {
            const playerInfo = allPlayers.find((p) => p.steamID64 === deleted.steamID64);
            if (playerInfo) {
                playerInfo.deleted = true;
            }
        }
    }
}
