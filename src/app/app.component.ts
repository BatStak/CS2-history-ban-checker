import { AfterViewInit, ChangeDetectorRef, Component, inject, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DataService } from '../services/data.service';
import { UtilsService } from '../services/utils.service';


import { debounceTime, Subject, Subscription } from 'rxjs';
import { BanInfo, Database, MatchFormat, PlayerInfo } from '../models';
import { DatabaseService } from '../services/database.service';
import { ScannerComponent } from './components/ban-scanner/ban-scanner.component';
import { BanStatisticsComponent } from './components/ban-statistics/ban-statistics.component';
import { HistoryLoaderComponent } from './components/history-loader/history-loader.component';
import { OptionsComponent } from './components/options/options.component';
import { PlayerSummary, SteamService } from '../services/steam.service';
import { BanListComponent } from './components/ban-list/ban-list.component';

@Component({
    selector: 'cs2-history-app-root',
    imports: [
        FormsModule,
        OptionsComponent,
        HistoryLoaderComponent,
        ScannerComponent,
        BanStatisticsComponent,
        BanListComponent
    ],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements AfterViewInit, OnDestroy {
    readonly databaseService = inject(DatabaseService);
    readonly utilsService = inject(UtilsService);
    readonly dataService = inject(DataService);
    readonly cdr = inject(ChangeDetectorRef);
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
    onChangeSubscription?: Subscription;

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

    profileRegex = /^\/(id|profiles)\/[A-Za-z0-9-_]+\/?$/;

    selfStatus = 'Scanning self status...';
    friendsStatus = 'Scanning friends status...';
    hideList = true;
    friendsBanned: PlayerInfo[] = [];

    get hideHistoryTable() {
        return this.dataService.database?.hideHistoryTable;
    }

    constructor() {
        this.isOnProfilePage = this.profileRegex.test(document.location.pathname);
        this.onChangeSubscription = this.dataService.onChange.subscribe(() => this.cdr.markForCheck());
    }

    async ngAfterViewInit() {
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
        this.cdr.markForCheck();
    }

    ngOnDestroy(): void {
        this.onDomUpdatedSubscription?.unsubscribe();
        this.onResetSubcription?.unsubscribe();
        this.onChangeSubscription?.unsubscribe();
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
            this.cdr.markForCheck();
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
                await this.scanFriends(steamIDs);
            }
        }).catch(async () => {
            const steamIDs = await this.scrapeFriendsList(currentSteamID);
            if (steamIDs) {
                await this.scanFriends(steamIDs);
            } else {
                this.friendsStatus = 'Could not retrieve friends list. It may be set to private or friends-only.';
                this.cdr.markForCheck();
            }
        });
    }

    private async scrapeFriendsList(steamID: string): Promise<string[] | null> {
        const friendsLink = document.querySelector<HTMLAnchorElement>('.profile_friend_links a[href*="/friends"]');
        if (!friendsLink) return null;
        try {
            const res = await fetch(friendsLink.href);
            if (!res.ok) return null;
            const html = await res.text();
            const doc = new DOMParser().parseFromString(html, 'text/html');
            const blocks = doc.querySelectorAll<HTMLElement>('.friend_block_v2[data-steamid]');
            if (!blocks.length) return null;
            return [...new Set(Array.from(blocks).map(el => el.dataset['steamid']!))];
        } catch {
            return null;
        }
    }

    private async scanFriends(steamIDs: string[]) {
        const friendsCount = steamIDs.length;
        this.friendsBanned = [];
        const ids = [...steamIDs];
        while (ids.length) {
            const chunk = ids.splice(0, 100);
            const results: BanInfo[] = await this.steamService.scanPlayers(chunk);
            const banned = results.filter((ban: BanInfo) => ban.NumberOfGameBans || ban.NumberOfVACBans)
                .map((ban: BanInfo) => ({
                    steamID64: ban.SteamId,
                    banInfo: ban,
                    matches: [],
                } as PlayerInfo));

            const summaries: PlayerSummary[] = await this.steamService.getPlayerSummaries(chunk);
            summaries.forEach(summary => {
                const friend = banned.find(player => player.steamID64 === summary.steamid);
                if (friend) {
                    friend.avatarLink = summary.avatarmedium;
                    friend.name = summary.personaname;
                    friend.profileLink = summary.profileurl;
                    friend.banInfo!.LastBanOn = new Date(new Date().setDate(new Date().getDate() - friend.banInfo!.DaysSinceLastBan)).toISOString();
                }
            });
            this.friendsBanned = [...this.friendsBanned, ...banned];
            this.cdr.markForCheck();
        }
        if (this.friendsBanned.length) {
            const percentageBanned = this.dataService.getPercentage(this.friendsBanned.length, friendsCount);
            this.friendsStatus = `friends status : <span class="banned">
                ${this.friendsBanned.length} / ${friendsCount} (${percentageBanned}%) friends have been banned
            </span>`;
        } else {
            this.friendsStatus = 'friends status : <span class="clean">clean</span>';
        }
        this.cdr.markForCheck();
    }
}
