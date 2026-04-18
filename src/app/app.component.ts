import { AfterViewInit, ApplicationRef, Component, DoCheck, HostBinding, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';
import { UtilsService } from '../services/utils.service';


import Bowser from 'bowser';
import { debounceTime, Subject, Subscription } from 'rxjs';
import { Database, MatchFormat } from '../models';
import { DatabaseService } from '../services/database.service';
import { ScannerComponent } from './components/ban-scanner/ban-scanner.component';
import { BanStatisticsComponent } from './components/ban-statistics/ban-statistics.component';
import { HistoryLoaderComponent } from './components/history-loader/history-loader.component';
import { OptionsComponent } from './components/options/options.component';
import { SteamService } from '../services/steam.service';

@Component({
    selector: 'cs2-history-app-root',
    imports: [
        FormsModule,
        OptionsComponent,
        HistoryLoaderComponent,
        ScannerComponent,
        BanStatisticsComponent
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit, OnDestroy {
    readonly databaseService = inject(DatabaseService);
    readonly utilsService = inject(UtilsService);
    readonly dataService = inject(DataService);
    readonly applicationRef = inject(ApplicationRef);
    readonly steamService = inject(SteamService);

    get hasRemovedHistoryLoaded(): boolean {
        return this.utilsService.hasRemovedHistoryLoaded;
    }

    ready = false;

    isOnProfilePage = false;

    get database(): Database {
        return this.dataService.database;
    }

    onDomUpdated = new Subject<void>();
    onDomUpdatedSubscription?: Subscription;
    onResetSubcription?: Subscription;

    validTabs = [
        'matchhistorypremier', // premier
        'matchhistorycompetitivepermap', // competitive
        'matchhistorywingman', // wingman
        'matchhistoryscrimmage', // scrimmage
        'matchhistorycompetitive', // csgo
    ];
    format?: MatchFormat;
    domCheckDebounceTimeInMs = 250;

    gcpdCSSRootSelector = '.csgo_scoreboard_root > tbody';

    profileRegex = /^\/id\/[A-Za-z0-9-_]+\/?$/;

    selfStatus = 'Scanning self status...';
    friendsStatus = 'Scanning friends status...';

    get hideHistoryTable() {
        return this.dataService.database?.hideHistoryTable;
    }

    constructor() {
        this.isOnProfilePage = this.profileRegex.test(document.location.pathname);
    }

    async ngAfterViewInit() {
        // for some reason, change detection does not work in firefox extension
        if (Bowser.getParser(window.navigator.userAgent).getBrowserName() === 'Firefox') {
            setInterval(() => this.applicationRef.tick(), 100);
        }

        const database = await this.databaseService.getDatabase();
        const section = new URLSearchParams(document.location.search).get('tab') || undefined;

        const validTab = !!section && this.validTabs.includes(section);
        if (validTab) {
            if (section === 'matchhistorywingman') {
                this.format = MatchFormat.MR8;
            } else if (section === 'matchhistorycompetitive') {
                this.format = MatchFormat.MR15;
            } else {
                this.format = MatchFormat.MR12;
            }
            this.onResetSubcription = this.dataService.onReset.subscribe(() => {
                this.update();
            });
        }
        this.dataService.init(database, section, this.format);

        this.update();

        if (this.isOnProfilePage) {
            this.scanSelf();
        } else {
            this.onDomUpdatedSubscription = this.onDomUpdated
                .pipe(debounceTime(this.domCheckDebounceTimeInMs))
                .subscribe(() => {
                    this.update();
                });
            this.observeDomChanges();
        }

        this.ready = true;
    }

    ngOnDestroy(): void {
        this.onDomUpdatedSubscription?.unsubscribe();
        this.onResetSubcription?.unsubscribe();
    }

    observeDomChanges() {
        const results = document.querySelector<HTMLElement>(this.gcpdCSSRootSelector);
        if (results) {
            const observer = new MutationObserver(() => {
                this.onDomUpdated.next();
            });
            observer.observe(results, {
                attributeOldValue: false,
                attributes: false,
                characterData: false,
                characterDataOldValue: false,
                childList: true,
                subtree: false,
            });
        }
    }

    update() {
        if (!this.isOnProfilePage) {
            this.utilsService.getHistoryPeriod();
            this.dataService.parseMatches();
            if (this.database.hideHistoryTable && this.utilsService.isLoadingHistory) {
                this.dataService.cleanParsedMatches();
            }
        }
        this.dataService.save();
    }

    scanSelf() {
        const avatar = document.querySelector<HTMLElement>('.profile_header .playerAvatar')!;
        const currentSteamID = this.utilsService.getSteamID64FromMiniProfileId(avatar.dataset['miniprofile']!);
        this.steamService.scanPlayers([currentSteamID]).then((results) => {
            const values = results[0];
            if (values.NumberOfGameBans || values.NumberOfVACBans) {
                this.selfStatus = `<span class="banned">
                    This player has ${values.NumberOfGameBans} game ban${values.NumberOfGameBans > 1 ? 's' : ''}
                    and ${values.NumberOfVACBans} VAC ban${values.NumberOfVACBans > 1 ? 's' : ''},
                    last ban was ${values.DaysSinceLastBan} days ago</span>`;
            } else {
                this.selfStatus = 'self status : <span class="clean">clean</span>';
            }
        })
        fetch(
            `https://api.steampowered.com/ISteamUser/GetFriendList/v0001/?key=${this.dataService.database.apiKey}&steamid=${currentSteamID}`,
        ).then((res) => {
            if (res.ok) {
                return res.json();
            } else {
                throw Error(`Code ${res.status}. ${res.statusText}`);
            }
        }).then(async (data) => {
            const steamIDs: string[] = data?.friendslist?.friends?.map((f: any) => f.steamid);
            if (steamIDs) {
                const friendsCount = steamIDs.length;
                let bannedFriendsCount = 0;
                while (steamIDs.length) {
                    const chunk = steamIDs.splice(0, 100);
                    const results = await this.steamService.scanPlayers(chunk);
                    bannedFriendsCount += results.filter(f => f.NumberOfGameBans || f.NumberOfVACBans).length;
                }
                if (bannedFriendsCount) {
                    const percentageBanned = this.dataService.getPercentage(bannedFriendsCount, friendsCount);
                    this.friendsStatus = `friends status : <span class="banned">${bannedFriendsCount} / ${friendsCount} (${percentageBanned}%) friends have been banned</span>`
                } else {
                    this.friendsStatus = 'friends status : <span class="clean">clean</span>';
                }
            }
        }).catch((error) => {
            this.friendsStatus = 'An error occured to retrieve friends list, maybe private ?'
        });
    }
}
