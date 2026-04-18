import { CommonModule } from '@angular/common';
import { Component, inject, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { differenceInDays, parse } from 'date-fns';
import { MatchInfo, PlayerInfo } from '../../../models';
import { DataService } from '../../../services/data.service';
import { MapDatasComponent } from '../map-datas/map-datas.component';
import { BanListComponent } from '../ban-list/ban-list.component';

@Component({
    selector: 'cs2-history-ban-statistics',
    imports: [CommonModule, MapDatasComponent, BanListComponent],
    templateUrl: './ban-statistics.component.html',
    styleUrl: './ban-statistics.component.scss',
})
export class BanStatisticsComponent implements OnDestroy {
    dataService = inject(DataService);

    displayListOfBannedPlayers = true;

    playersCount = 0;
    bannedCount = 0;
    bannedPourcentage = 0;

    matchesCount = 0;
    matchesConcerned = 0;
    matchPourcentage = 0;

    matchesAgainstCheaters = 0;
    matchesWithCheaters = 0;
    matchesBothTeamsHasCheaters = 0;
    matchesAgainstCheatersPercentage = 0;
    matchesWithCheatersPercentage = 0;
    matchesBothTeamsHasCheatersPercentage = 0;
    frequencyInDaysOfBans = -1;
    unlucky = false;

    percentageBannedInSection = 0;

    get playersBanned(): PlayerInfo[] {
        return this.dataService.playersBannedFiltered;
    }

    get players(): PlayerInfo[] {
        return this.dataService.filteredPlayers;
    }

    onStatisticsUpdatedSubscription?: Subscription;

    constructor() {
        this.onStatisticsUpdatedSubscription = this.dataService.onStatisticsUpdated.subscribe(() => {
            this.update();
        });

        this.update();
    }

    ngOnDestroy(): void {
        this.onStatisticsUpdatedSubscription?.unsubscribe();
    }

    update() {
        this.matchesAgainstCheaters = 0;
        this.matchesWithCheaters = 0;
        this.matchesBothTeamsHasCheaters = 0;

        this.playersCount = this.dataService.filteredPlayers.length;
        this.bannedCount = this.playersBanned.length;
        this.bannedPourcentage = this.dataService.getPercentage(this.bannedCount, this.playersCount);

        this.matchesCount = this.dataService.filteredMatches.length;
        const matchWithBans = this.dataService.filteredMatches.filter((m) =>
            this.playersBanned.some((p) => m.playersSteamID64.includes(p.steamID64)),
        );
        this.matchesConcerned = matchWithBans.length || 0;
        this.matchPourcentage = this.dataService.getPercentage(this.matchesConcerned, this.matchesCount);

        this.calculateUnluckyStats(matchWithBans);

        this.getFrequencyBans(new Date());

        this.percentageBannedInSection = this.dataService.getPercentage(this.playersBanned.length, this.players.length);
    }

    getFrequencyBans(now: Date) {
        if (this.playersBanned.length && this.dataService.oldestMatch?.id) {
            const diffInDays = differenceInDays(
                now,
                parse(this.dataService.oldestMatch?.id!, "yyyy-MM-dd HH:mm:ss 'GMT'", now),
            );
            this.frequencyInDaysOfBans = Math.round(diffInDays / this.playersBanned.length);
        }
    }

    calculateUnluckyStats(matchWithBans: MatchInfo[]) {
        if (this.matchesConcerned > 0) {
            matchWithBans.forEach((match) => {
                const userTeam = match.teamA?.scores?.some((player) => player.steamID64 === this.dataService.mySteamId)
                    ? 'A'
                    : 'B';
                const cheaterInTeamA = match.teamA?.scores?.some((player) =>
                    this.playersBanned.some((cheater) => cheater.steamID64 === player.steamID64),
                );
                const cheaterInTeamB = match.teamB?.scores?.some((player) =>
                    this.playersBanned.some((cheater) => cheater.steamID64 === player.steamID64),
                );

                if (cheaterInTeamA && cheaterInTeamB) {
                    this.matchesBothTeamsHasCheaters++;
                } else if (userTeam === 'A') {
                    if (cheaterInTeamA) {
                        this.matchesWithCheaters++;
                    } else {
                        this.matchesAgainstCheaters++;
                    }
                } else if (userTeam === 'B') {
                    if (cheaterInTeamB) {
                        this.matchesWithCheaters++;
                    } else {
                        this.matchesAgainstCheaters++;
                    }
                }
            });

            this.matchesAgainstCheatersPercentage = this.dataService.getPercentage(
                this.matchesAgainstCheaters,
                this.matchesConcerned,
            );
            this.matchesWithCheatersPercentage = this.dataService.getPercentage(
                this.matchesWithCheaters,
                this.matchesConcerned,
            );
            this.matchesBothTeamsHasCheatersPercentage = this.dataService.getPercentage(
                this.matchesBothTeamsHasCheaters,
                this.matchesConcerned,
            );

            this.unlucky = (this.matchesAgainstCheatersPercentage - this.matchesWithCheatersPercentage) > 5;
        }
    }
}
