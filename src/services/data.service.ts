import { inject, Injectable } from '@angular/core';
import { formatDistance } from 'date-fns';
import { debounceTime, Subject } from 'rxjs';
import { BanInfo, Database, MatchFormat, MatchInfo, PlayerInfo, PlayerScore, TeamInfo } from '../models';
import { MapNamePipe } from '../pipes/mapName.pipe';
import { DatabaseService } from './database.service';
import { UtilsService } from './utils.service';

export interface WinrateData {
  map: string;
  sampleSize: number;
  wins: number;
  withSomeoneBanAfter: number;
  winrate?: number;
  banrate?: number;
}

@Injectable({ providedIn: 'root' })
export class DataService {
  _databaseService = inject(DatabaseService);
  _utilsService = inject(UtilsService);

  onSave = new Subject<void>();
  onStatisticsUpdate = new Subject<boolean>();
  onStatisticsUpdated = new Subject<void>();
  onReset = new Subject<void>();

  database: Database = {
    matches: [],
    players: [],
  };

  mySteamId: string | undefined;

  section?: string;
  format?: MatchFormat;

  filteredPlayers: PlayerInfo[] = [];
  filteredMatches: MatchInfo[] = [];

  playersNotScannedYet: PlayerInfo[] = [];
  oldestScan?: BanInfo;
  oldestMatch?: MatchInfo;

  playersBanned: PlayerInfo[] = [];
  playersBannedFiltered: PlayerInfo[] = [];

  newPlayersBanned = false;

  refreshDebounceTimeInMs = 500;

  _friendsListCssSelector = '.friend_block_content';
  _avatarCssSelector = '.player_avatar img';

  _banTitles: Record<string, string> = {};

  private _mapNamePipe = new MapNamePipe();

  constructor() {
    this.mySteamId = document.body.innerHTML?.match(/g_steamID = \"([0-9]+)\"/)?.[1];

    this.onSave.pipe(debounceTime(this.refreshDebounceTimeInMs)).subscribe(() => {
      this._save();
    });

    this.onStatisticsUpdate.pipe(debounceTime(this.refreshDebounceTimeInMs)).subscribe((updateFlags: boolean) => {
      this._updateStatistics(updateFlags);
    });
  }

  init(database?: any, section?: string, format?: MatchFormat) {
    if (database) {
      this.database = database;
    }
    if (section) {
      this.section = section;
    }
    if (format) {
      this.format = format;
    }

    this.database ??= { matches: [], players: [] };
    this.database.matches ??= [];
    this.database.players ??= [];

    // to avoid having empty results on next version because we add "section" attributes between 2 versions
    if (this.database.matches.some((m) => !m.section)) {
      this.reset();
    } else {
      this.onStatisticsUpdate.next(false);
    }
  }

  async reset() {
    // we remove storage but keep apiKey
    this.database = {
      apiKey: this.database.apiKey,
      hideHistoryTable: false,
      matches: [],
      players: [],
    };
    await this._databaseService.setDatabase(this.database);
    document.location.reload();
  }

  parseMatches() {
    const matches = document.querySelectorAll<HTMLElement>(this._utilsService.matchesNotParsedCssSelector);
    for (let match of Array.from(matches)) {
      this._parseMatch(match, this.format!);
    }
  }

  parseFriends() {
    this.filteredPlayers = [];
    const players = document.querySelectorAll<HTMLElement>(this._utilsService.friendsListCssSelector);
    for (let player of Array.from(players)) {
      const steamID64 = player.dataset['steamid']!;
      // add playerInfo to global list
      let playerInfo = this.database.players.find((p) => p.steamID64 === steamID64);
      if (!playerInfo) {
        playerInfo = {
          steamID64: steamID64,
          name: player.querySelector<HTMLElement>(this._friendsListCssSelector)?.childNodes[0]?.textContent?.trim(),
          profileLink: player.querySelector<HTMLLinkElement>('a')?.href,
          avatarLink: player.querySelector<HTMLImageElement>(this._avatarCssSelector)?.src,
          matches: [],
        };
        this.database.players.push(playerInfo);
      }
      this.filteredPlayers.push(playerInfo);
      if (playerInfo.banInfo?.NumberOfGameBans || playerInfo.banInfo?.NumberOfVACBans) {
        player.classList.add('banned');
        player.setAttribute('title', this.getBanTitle(playerInfo));
      }
    }
  }

  cleanParsedMatches() {
    const matches = document.querySelectorAll<HTMLElement>(this._utilsService.matchesParsedCssSelector);
    for (let match of Array.from(matches)) {
      match.remove();
    }
    this._utilsService.hasRemovedHistoryLoaded = true;
  }

  getMapDatas() {
    const results: WinrateData[] = [];
    let wins = 0;
    let withSomeoneBanAfter = 0;
    this.filteredMatches.forEach((matchInfo: MatchInfo) => {
      const winrate = this._getWinrateDataForMap(results, matchInfo.map!);
      winrate.sampleSize++;
      if (this._isPlayerWinIntoTeam(matchInfo.teamA) || this._isPlayerWinIntoTeam(matchInfo.teamB)) {
        winrate.wins++;
        wins++;
      }
      if (this._matchHasPlayerBanAfter(matchInfo)) {
        winrate.withSomeoneBanAfter++;
        withSomeoneBanAfter++;
      }
    });

    results.push({
      map: 'All maps',
      wins: wins,
      withSomeoneBanAfter: withSomeoneBanAfter,
      sampleSize: this.filteredMatches.length,
    });

    results.forEach((winrate) => {
      winrate.winrate = (100 * winrate.wins) / winrate.sampleSize;
      winrate.banrate = (100 * winrate.withSomeoneBanAfter) / winrate.sampleSize;
    });

    results.sort((a, b) => {
      return a.map < b.map || a.map === 'All maps' ? -1 : 1;
    });

    return results;
  }

  private _mapNames: Record<string, string> = {};
  private _getWinrateDataForMap(results: WinrateData[], map: string) {
    this._mapNames[map] = this._mapNames[map] || this._mapNamePipe.transform(map);
    let winrate = results.find((winrate) => winrate.map === this._mapNames[map]);
    if (!winrate) {
      winrate = {
        map: this._mapNames[map],
        sampleSize: 0,
        wins: 0,
        withSomeoneBanAfter: 0,
      };
      results.push(winrate);
    }
    return winrate;
  }

  private _isPlayerWinIntoTeam(team?: TeamInfo) {
    return (
      team?.scores && team.scores.some((playerScore) => playerScore.steamID64 === this.mySteamId) && team.win === 1
    );
  }

  private _matchHasPlayerBanAfter(match: MatchInfo) {
    return this.playersBannedFiltered.some((playerBanned) => match.playersSteamID64.includes(playerBanned.steamID64));
  }

  parseSteamResults(results: BanInfo[]) {
    for (let banInfo of results) {
      const playerInfo = this.database.players.find((p) => p.steamID64 === banInfo.SteamId);
      if (playerInfo) {
        banInfo.LastFetch = new Date().toISOString();
        banInfo.LastBanOn = new Date(new Date().setDate(new Date().getDate() - banInfo.DaysSinceLastBan)).toISOString();
        playerInfo.banInfo = banInfo;
      }
    }

    this.save();
  }

  save() {
    this.onSave.next();
  }

  private async _save() {
    this.onStatisticsUpdate.next(true);
    await this._databaseService.setDatabase(this.database);
  }

  _parseMatch(match: HTMLElement, format: MatchFormat) {
    const matchId = this._utilsService.getDateOfMatch(match);
    let matchInfo = this.database.matches.find((m) => m.id === matchId);
    if (!matchInfo) {
      matchInfo = {
        id: matchId,
        section: this.section,
        map: this._utilsService.getMap(match),
        finished: true,
        format: format,
        overtime: false,
        replayLink: this._utilsService.getReplayLink(match),
        teamA: { scores: [] },
        teamB: { scores: [] },
        playersSteamID64: [],
      };
      this.database.matches.push(matchInfo);
    }

    matchInfo.finished ??= true;
    matchInfo.format ??= format;
    matchInfo.overtime ??= false;
    matchInfo.playersSteamID64 ??= [];
    matchInfo.teamA ??= { scores: [] };
    matchInfo.teamB ??= { scores: [] };

    // reset scores
    matchInfo.teamA.scores = [];
    matchInfo.teamB.scores = [];

    const players = match.querySelectorAll<HTMLTableRowElement>(this._utilsService.playersCssSelector);

    let isTeamA = true;
    for (let index = 0; index < players.length; index++) {
      const playerRow = players[index];
      if (playerRow.children.length > 1) {
        if (index) {
          // get html attributes
          const linkTitle = playerRow.querySelector<HTMLLinkElement>('.linkTitle')!;
          const steamID64 = this._utilsService.getSteamID64FromMiniProfileId(linkTitle.dataset['miniprofile']!);

          // add steamId to matchInfo players list
          if (!matchInfo!.playersSteamID64.includes(steamID64)) {
            matchInfo!.playersSteamID64.push(steamID64);
          }

          // delete unused data which were leaking btw
          delete (matchInfo.teamA as any).playersSteamID64;
          delete (matchInfo.teamB as any).playersSteamID64;

          // add steamId to team X players list
          if (isTeamA) {
            matchInfo.teamA.scores.push(this._addPlayerScore(steamID64, playerRow));
          } else {
            matchInfo.teamB.scores.push(this._addPlayerScore(steamID64, playerRow));
          }

          // add playerInfo to global list
          let playerInfo = this.database.players.find((p) => p.steamID64 === steamID64);
          const profileName = linkTitle.textContent?.trim();
          const profileLink = linkTitle.href;
          const profileAvatarLink = playerRow.querySelector<HTMLImageElement>('.playerAvatar img')?.src;
          if (!playerInfo) {
            playerInfo = {
              steamID64: steamID64,
              name: profileName,
              profileLink: profileLink,
              avatarLink: profileAvatarLink,
              lastPlayWith: matchInfo!.id,
              matches: [matchInfo!.id!],
            };
            this.database.players.push(playerInfo);
          } else {
            // we update infos from player
            playerInfo.name = profileName;
            playerInfo.profileLink = profileLink;
            playerInfo.avatarLink = profileAvatarLink;

            const matchId = matchInfo.id;
            if (matchId) {
              // we add the match to the list of the playerInfo matches
              if (!playerInfo.matches.includes(matchId)) {
                playerInfo.matches.push(matchId);
              }

              // if this match is more recent than the lastPlayWith field, we update the field
              if (!playerInfo.lastPlayWith || matchId > playerInfo.lastPlayWith) {
                playerInfo.lastPlayWith = matchInfo.id;
              }
            }
          }
        }
      } else {
        isTeamA = false;
        const colspan = playerRow.children[0].getAttribute('colspan');
        if (colspan) {
          playerRow.children[0].setAttribute('colspan', `${parseInt(colspan, 10) + 1}`);
        }
        const scores = playerRow.textContent?.trim().match(/(\d+) : (\d+)/);
        if (scores?.length && scores?.length > 2) {
          const scoreA = parseInt(scores[1], 10);
          const scoreB = parseInt(scores[2], 10);
          matchInfo!.teamA!.score = scoreA;
          matchInfo!.teamB!.score = scoreB;

          matchInfo!.teamA!.win = this._getWin(scoreA, scoreB);
          matchInfo!.teamB!.win = this._getWin(scoreB, scoreA);

          matchInfo!.overtime = this._isOvertime(scoreA, scoreB, format);
          matchInfo!.finished = this._isFinished(scoreA, scoreB, format);
        }
      }
    }

    match.classList.add('parsed');
  }

  getBanTitle(playerInfo: PlayerInfo) {
    if (playerInfo.banInfo) {
      const banInfo = playerInfo.banInfo;
      if (!this._banTitles[playerInfo.steamID64]) {
        let infos = '';
        if (banInfo.NumberOfVACBans) {
          infos += `${banInfo.NumberOfVACBans} VAC ban${banInfo.NumberOfVACBans > 1 ? 's' : ''}`;
        }
        if (banInfo.NumberOfGameBans) {
          infos += `${infos ? ', ' : ''}${banInfo.NumberOfGameBans} Game ban${banInfo.NumberOfGameBans > 1 ? 's' : ''}`;
        }
        if (banInfo.NumberOfVACBans || banInfo.NumberOfGameBans) {
          infos += `, last ban was ${formatDistance(banInfo.LastBanOn, new Date(), {
            addSuffix: true,
          })}`;
        }
        this._banTitles[playerInfo.steamID64] = infos;
      }
    }

    return this._banTitles[playerInfo.steamID64];
  }

  _addPlayerScore(steamID64: string, playerRow: HTMLTableRowElement): PlayerScore {
    return {
      steamID64: steamID64,
      ping: playerRow.children[1].textContent,
      k: playerRow.children[2].textContent,
      a: playerRow.children[3].textContent,
      d: playerRow.children[4].textContent,
      mvp: playerRow.children[5].textContent,
      hsp: playerRow.children[6].textContent,
      score: playerRow.children[7].textContent,
    };
  }

  _updateStatistics(updateFlags: boolean) {
    this.database.players.sort((a, b) => this._sortPlayers(a, b));
    this.database.matches.sort((a, b) => this._sortMatches(a, b));

    // flag to know if we need to filter players banned after playing with them
    const filterBannedAfter = !!this.section;

    if (this.section) {
      // filter matches from the section we are on
      this.filteredMatches = this.database.matches.filter((m) => m.section === this.section);

      // filter players from the section we are on
      this.filteredPlayers = this.database.players.filter(
        (p) => !p.deleted && this.filteredMatches.some((m) => m.playersSteamID64?.includes(p.steamID64)),
      );
    } else {
      this.parseFriends();
    }

    // get players that has no ban information
    this.playersNotScannedYet = this.filteredPlayers.filter((p) => !p.banInfo?.LastFetch);
    const playersScanned = this.filteredPlayers.filter((p) => p.banInfo?.LastFetch);
    if (playersScanned.length) {
      this.oldestScan = playersScanned[0].banInfo;
    } else {
      this.oldestScan = undefined;
    }

    // get oldest match of history
    this.oldestMatch = this.filteredMatches[0];

    // get player banned
    const banInfosList = this.filteredPlayers
      .filter((p) => p.banInfo?.NumberOfGameBans || p.banInfo?.NumberOfVACBans)
      .map((p) => p.banInfo!);

    this.playersBanned = this.filteredPlayers
      ?.filter((p) => banInfosList.some((b) => b.SteamId === p.steamID64))
      .sort((a, b) => this._sortBannedPlayers(a, b));

    // get players banned after playing with them
    const playersBannedFiltered = filterBannedAfter
      ? this.playersBanned.filter(
          (p) =>
            // we take only people banned after playing with them
            p.banInfo && p.lastPlayWith && p.banInfo.LastBanOn > p.lastPlayWith,
        )
      : this.playersBanned;

    // update flag to know that there are new people banned
    if (updateFlags && playersBannedFiltered.length !== this.playersBannedFiltered.length) {
      this.newPlayersBanned = true;
    }
    this.playersBannedFiltered = playersBannedFiltered;

    this.onStatisticsUpdated.next();
  }

  /**
   * we sort player : the ones we did not scan yet, then the older scanned first
   */
  _sortPlayers(playerA: PlayerInfo, playerB: PlayerInfo) {
    let result = 0;

    if (playerA.banInfo?.LastFetch || playerB.banInfo?.LastFetch) {
      if (!playerA.banInfo?.LastFetch) {
        result = -1;
      } else if (!playerB.banInfo?.LastFetch) {
        result = 1;
      } else if (playerA.banInfo!.LastFetch < playerB.banInfo!.LastFetch) {
        result = -1;
      } else {
        result = 1;
      }
    }

    return result;
  }

  /**
   * we sort matchs by date ascending
   */
  _sortMatches(matchA: MatchInfo, matchB: MatchInfo) {
    return matchA.id! < matchB.id! ? -1 : 1;
  }

  /**
   * we sort by most recent bans first, then steamID to ensure the order is always the same
   */
  _sortBannedPlayers(playerA: PlayerInfo, playerB: PlayerInfo) {
    const playerALastBanOn = playerA.banInfo!.LastBanOn;
    const playerBLastBanOn = playerB.banInfo!.LastBanOn;
    const result =
      playerALastBanOn === playerBLastBanOn
        ? // alpha
          playerA.steamID64 < playerB.steamID64
          ? -1
          : 1
        : // more recent first
          playerALastBanOn < playerBLastBanOn
          ? 1
          : -1;
    return result;
  }

  _isOvertime(scoreA: number, scoreB: number, format: MatchFormat): boolean {
    let isOvertime = false;
    switch (format) {
      case MatchFormat.MR12:
        isOvertime = scoreA >= 12 && scoreB >= 12;
        break;
    }
    return isOvertime;
  }

  _isFinished(scoreA: number, scoreB: number, format: MatchFormat): boolean {
    let drawScore: number;
    let winScore: number;
    switch (format) {
      case MatchFormat.MR12:
        drawScore = 15;
        winScore = 13;
        break;
      case MatchFormat.MR15:
        drawScore = 15;
        winScore = 16;
        break;
      case MatchFormat.MR8:
        drawScore = 8;
        winScore = 9;
        break;
    }
    if (scoreA === scoreB && scoreA === drawScore) {
      return true;
    }
    return scoreA !== scoreB && (scoreA === winScore || scoreB === winScore);
  }

  _getWin(teamScore: number, oppositeTeamScore: number) {
    return teamScore > oppositeTeamScore ? 1 : teamScore < oppositeTeamScore ? -1 : 0;
  }
}
