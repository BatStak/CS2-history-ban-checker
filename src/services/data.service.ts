import { Injectable } from '@angular/core';
import { Subject, debounceTime } from 'rxjs';
import { BanInfo, Database, MatchFormat, MatchInfo, PlayerInfo } from '../models';
import { DatabaseService } from './database.service';
import { UtilsService } from './utils.service';

@Injectable()
export class DataService {
  onSave = new Subject<void>();
  onStatisticsUpdated = new Subject<void>();
  onReset = new Subject<void>();

  database: Database = {
    matches: [],
    players: [],
  };

  section?: string;
  format?: MatchFormat;

  filteredPlayers: PlayerInfo[] = [];
  filteredMatches: MatchInfo[] = [];

  playersNotScannedYet: PlayerInfo[] = [];
  oldestScan?: BanInfo;
  oldestMatch?: MatchInfo;

  playersBanned: PlayerInfo[] = [];
  playersBannedAfter: PlayerInfo[] = [];

  newPlayersBanned = false;

  onSaveDebounceTimeInMs = 250;

  _friendsListCssSelector = '.friend_block_content';
  _avatarCssSelector = '.player_avatar img';

  constructor(private _databaseService: DatabaseService, private _utilsService: UtilsService) {
    this.onSave.pipe(debounceTime(this.onSaveDebounceTimeInMs)).subscribe(() => {
      this.save();
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
      this._updateStatistics(false);
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
      }
    }
  }

  cleanParsedMatches() {
    const matches = document.querySelectorAll<HTMLElement>(this._utilsService.matchesParsedNoBanCssSelector);
    for (let match of Array.from(matches)) {
      match.remove();
    }
  }

  parseSteamResults(results: BanInfo[]) {
    for (let banInfo of results) {
      const playerInfo = this.database.players.find((p) => p.steamID64 === banInfo.SteamId);
      if (playerInfo) {
        banInfo.LastFetch = new Date().toISOString();
        banInfo.LastBanOn = new Date(new Date().setDate(new Date().getDate() - banInfo.DaysSinceLastBan)).toISOString();
        playerInfo.banInfo = banInfo;

        // for each column of the player ban status, we get the match row and update ban status on the table row of the match
        const playerBanStatusList = document.querySelectorAll<HTMLElement>(
          this._getBanColumnForPlayer(playerInfo.steamID64)
        );
        if (playerBanStatusList?.length) {
          for (let playerBanStatus of Array.from(playerBanStatusList)) {
            const matchTableRow = playerBanStatus.closest<HTMLElement>('tr.parsed');
            if (matchTableRow) {
              this._updateMatchBanStatus(matchTableRow);
            }
          }
        }
      }
    }

    this.onSave.next();
  }

  async save() {
    this._updateStatistics();
    await this._databaseService.setDatabase(this.database);
  }

  _getBanColumnForPlayer(steamid64: string) {
    return `.banstatus[data-steamid64="${steamid64}"]`;
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
        teamA: { playersSteamID64: [] },
        teamB: { playersSteamID64: [] },
        playersSteamID64: [],
      };
      this.database.matches.push(matchInfo);
    }

    matchInfo.finished ??= true;
    matchInfo.format ??= format;
    matchInfo.overtime ??= false;
    matchInfo.teamA ??= { playersSteamID64: [] };
    matchInfo.teamB ??= { playersSteamID64: [] };
    matchInfo.playersSteamID64 ??= [];

    const players = match.querySelectorAll<HTMLTableRowElement>(this._utilsService.playersCssSelector);

    let isTeamA = true;
    for (let index = 0; index < players.length; index++) {
      const playerRow = players[index];
      if (playerRow.children.length > 1) {
        const lastColumn = playerRow.children[playerRow.children.length - 1];
        lastColumn.after(lastColumn.cloneNode(true));
        const banStatus = playerRow.children[playerRow.children.length - 1] as HTMLElement;
        if (index === 0) {
          banStatus.textContent = 'Ban status';
        } else {
          banStatus.textContent = '-';
          // get html attributes
          const profileLink = playerRow.querySelector<HTMLLinkElement>('.linkTitle')!;
          const steamID64 = this._utilsService.getSteamID64FromMiniProfileId(profileLink.dataset['miniprofile']!);

          // set html attributes
          banStatus.dataset['steamid64'] = steamID64;
          banStatus.classList.add('banstatus');

          // add steamId to matchInfo players list
          if (!matchInfo!.playersSteamID64.includes(steamID64)) {
            matchInfo!.playersSteamID64.push(steamID64);
          }

          // add steamId to team X players list
          if (isTeamA) {
            matchInfo!.teamA!.playersSteamID64.push(steamID64);
          } else {
            matchInfo!.teamB!.playersSteamID64.push(steamID64);
          }

          // add playerInfo to global list
          let playerInfo = this.database.players.find((p) => p.steamID64 === steamID64);
          if (!playerInfo) {
            playerInfo = {
              steamID64: steamID64,
              name: profileLink.textContent?.trim(),
              profileLink: profileLink.href,
              avatarLink: playerRow.querySelector<HTMLImageElement>('.playerAvatar img')?.src,
              lastPlayWith: matchInfo!.id,
              matches: [matchInfo!.id!],
            };
            this.database.players.push(playerInfo);
          } else {
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
    this._updateMatchBanStatus(match);
  }

  _updateStatistics(updateFlags = true) {
    this.database.players.sort((a, b) => this._sortPlayers(a, b));
    this.database.matches.sort((a, b) => this._sortMatches(a, b));

    // flag to know if we need to filter players banned after playing with them
    const filterBannedAfter = !!this.section;

    if (this.section) {
      // filter matches from the section we are on
      this.filteredMatches = this.database.matches.filter((m) => m.section === this.section);

      // filter players from the section we are on
      this.filteredPlayers = this.database.players.filter(
        (p) => !p.deleted && this.filteredMatches.some((m) => m.playersSteamID64?.includes(p.steamID64))
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
    const playersBannedAfter = filterBannedAfter
      ? this.playersBanned.filter(
          (p) =>
            // we take only people banned after playing with them
            p.banInfo && p.lastPlayWith && p.banInfo.LastBanOn > p.lastPlayWith
        )
      : this.playersBanned;

    // update flag to know that there are new people banned
    if (updateFlags && playersBannedAfter.length !== this.playersBannedAfter.length) {
      this.newPlayersBanned = true;
    }
    this.playersBannedAfter = playersBannedAfter;

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
   * we sort by most recent bans first
   */
  _sortBannedPlayers(playerA: PlayerInfo, playerB: PlayerInfo) {
    const playerADaysSinceLastBan = playerA.banInfo!.DaysSinceLastBan;
    const playerBDaysSinceLastBan = playerB.banInfo!.DaysSinceLastBan;
    return playerADaysSinceLastBan === playerBDaysSinceLastBan
      ? playerA.steamID64 < playerB.steamID64
        ? -1
        : 1
      : playerADaysSinceLastBan < playerBDaysSinceLastBan
      ? -1
      : 1;
  }

  _updateMatchBanStatus(match: HTMLElement) {
    const matchId = this._utilsService.getDateOfMatch(match);
    let matchInfo = this.database.matches.find((m) => m.id === matchId);

    for (let steamID64 of matchInfo!.playersSteamID64) {
      const playerInfo = this.database.players.find((p) => p.steamID64 === steamID64);
      const playerBannedColumn = document.querySelectorAll<HTMLElement>(this._getBanColumnForPlayer(steamID64));
      const banInfo = playerInfo?.banInfo;
      if (playerInfo?.lastPlayWith && banInfo && (banInfo.NumberOfVACBans || banInfo.NumberOfGameBans)) {
        let text = '';
        if (banInfo.NumberOfVACBans) {
          text += `${banInfo.NumberOfVACBans} VAC ban`;
        }
        if (banInfo.NumberOfVACBans && banInfo.NumberOfGameBans) {
          text += ' & ';
        }
        if (banInfo.NumberOfGameBans) {
          text += `${banInfo.NumberOfGameBans} GAME ban`;
        }
        const text2 = `last is ${banInfo.DaysSinceLastBan} days ago`;
        const div = document.createElement('div');
        div.textContent = text2;
        for (let elt of Array.from(playerBannedColumn)) {
          elt.textContent = text;
          elt.appendChild(div);
          elt.classList.add('banned');
          elt.classList.remove('not-banned');
          if (banInfo.LastBanOn > playerInfo.lastPlayWith) {
            elt.classList.add('after');
          }
        }

        // we display red the match only if ban occured after the game
        if (banInfo.LastBanOn > playerInfo.lastPlayWith) {
          match.classList.add('banned');
        }
      } else {
        for (let elt of Array.from(playerBannedColumn)) {
          elt.textContent = 'clean';
          elt.classList.remove('banned');
          elt.classList.add('not-banned');
        }
      }
    }
  }

  private _isOvertime(scoreA: number, scoreB: number, format: MatchFormat): boolean {
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

  private _getWin(teamScore: number, oppositeTeamScore: number) {
    return teamScore > oppositeTeamScore ? 1 : teamScore < oppositeTeamScore ? -1 : 0;
  }
}
