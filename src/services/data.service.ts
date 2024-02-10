import { Injectable } from '@angular/core';
import {
  BanInfo,
  Database,
  MatchFormat,
  MatchInfo,
  PlayerInfo,
} from '../models';
import { UtilsService } from './utils.service';
import { Subject, debounceTime } from 'rxjs';

@Injectable()
export class DataService {
  onSave = new Subject<void>();
  onStatisticsUpdated = new Subject<void>();
  onReset = new Subject<void>();

  database: Database = {};
  section?: string;
  format?: MatchFormat;

  players?: PlayerInfo[];
  matches?: MatchInfo[];

  playersNotScannedYet?: PlayerInfo[];
  oldestScan?: BanInfo;
  mostRecentScan?: BanInfo;
  oldestMatch?: MatchInfo;

  playersBanned: PlayerInfo[] = [];
  playersBannedAfter: PlayerInfo[] = [];

  constructor(private _utilsService: UtilsService) {
    this.onSave.pipe(debounceTime(250)).subscribe(() => {
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

    this.database ??= {};
    this.database.matches ??= [];
    this.database.players ??= [];

    // to avoid having empty results on next version because we add "section" attributes between 2 versions
    if (this.database.matches.some((m) => !m.section)) {
      this.reset();
    } else {
      this._updateStatistics();
    }
  }

  reset() {
    // we remove storage but keep apiKey
    this.database = {
      apiKey: this.database.apiKey,
      matches: [],
      players: [],
    };
    chrome.storage.local.set(this.database);
    document.location.reload();
  }

  parseMatches() {
    const matches = document.querySelectorAll<HTMLElement>(
      `${this._utilsService.matchesCssSelector}:not(.parsed)`
    );
    for (let match of Array.from(matches)) {
      this._parseMatch(match, this.format!);
    }
  }

  cleanParsedMatches() {
    const matches = document.querySelectorAll<HTMLElement>(
      `${this._utilsService.matchesCssSelector}.parsed:not(.banned)`
    );
    for (let match of Array.from(matches)) {
      match.remove();
    }
  }

  parseSteamResults(results: BanInfo[]) {
    for (let banInfo of results) {
      const playerInfo = this.database.players?.find(
        (p) => p.steamID64 === banInfo.SteamId
      );
      if (playerInfo) {
        banInfo.LastFetch = new Date().toISOString();
        banInfo.LastBanOn = new Date(
          new Date().setDate(new Date().getDate() - banInfo.DaysSinceLastBan)
        ).toISOString();
        playerInfo.banInfo = banInfo;

        // for each column of the player ban status, we get the match row and update ban status on the table row of the match
        const playerBanStatusList = document.querySelectorAll(
          `.banstatus[data-steamid64="${playerInfo.steamID64}"]`
        );
        if (playerBanStatusList?.length) {
          for (let playerBanStatus of Array.from(playerBanStatusList)) {
            const matchTableRow =
              playerBanStatus.closest<HTMLElement>('tr.parsed');
            if (matchTableRow) {
              this._updateMatchBanStatus(matchTableRow);
            }
          }
        }
      }
    }

    this.onSave.next();
  }

  save() {
    this._updateStatistics();
    chrome.storage.local.set(this.database);
  }

  private _parseMatch(match: HTMLElement, format: MatchFormat) {
    this.database.matches ??= [];
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

    const players = match.querySelectorAll<HTMLTableRowElement>(
      this._utilsService.playersCssSelector
    );

    let isTeamA = true;
    for (let index = 0; index < players.length; index++) {
      const playerRow = players[index];
      if (playerRow.children.length > 1) {
        const lastColumn = playerRow.children[playerRow.children.length - 1];
        lastColumn.after(lastColumn.cloneNode(true));
        const banStatus = playerRow.children[
          playerRow.children.length - 1
        ] as HTMLElement;
        if (index === 0) {
          banStatus.textContent = 'Ban status';
        } else {
          banStatus.textContent = '-';
          // get html attributes
          const profileLink =
            playerRow.querySelector<HTMLLinkElement>('.linkTitle')!;
          const steamID64 = this._utilsService.getSteamID64FromMiniProfileId(
            profileLink.dataset['miniprofile']!
          );

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
          let playerInfo = this.database.players!.find(
            (p) => p.steamID64 === steamID64
          );
          if (!playerInfo) {
            playerInfo = {
              steamID64: steamID64,
              name: profileLink.textContent?.trim(),
              profileLink: profileLink.href,
              avatarLink:
                playerRow.querySelector<HTMLImageElement>('.playerAvatar img')
                  ?.src,
              lastPlayWith: matchInfo!.id,
              matches: [matchInfo!.id!],
            };
            this.database.players?.push(playerInfo);
          } else if (playerInfo.matches.includes(matchInfo!.id!)) {
            playerInfo.matches.push(matchInfo!.id!);
          }
        }
      } else {
        isTeamA = false;
        const colspan = playerRow.children[0].getAttribute('colspan');
        if (colspan) {
          playerRow.children[0].setAttribute(
            'colspan',
            `${parseInt(colspan, 10) + 1}`
          );
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

  private _updateStatistics() {
    if (this.database.players && this.database.matches) {
      this.database.players.sort((a, b) => this._sortPlayers(a, b));
      this.database.matches?.sort((a, b) => this._sortMatches(a, b));

      // filter matches from the section we are on
      this.matches = this.database.matches.filter(
        (m) => m.section === this.section
      );

      // filter players from the section we are on
      this.players = this.database.players.filter((p) =>
        this.matches?.some((m) => m.playersSteamID64?.includes(p.steamID64))
      );

      this.playersNotScannedYet = this.players.filter(
        (p) => !p.banInfo?.LastFetch
      );
      const playersScanned = this.players.filter((p) => p.banInfo?.LastFetch);
      if (playersScanned.length) {
        this.oldestScan = playersScanned[0].banInfo;
        this.mostRecentScan = playersScanned[playersScanned.length - 1].banInfo;
      }

      this.oldestMatch = this.matches?.[0];

      const banInfosList = this.players
        .filter(
          (p) =>
            p.banInfo &&
            p.lastPlayWith &&
            (p.banInfo.NumberOfGameBans > 0 || p.banInfo.NumberOfVACBans > 0)
        )
        .map((p) => p.banInfo!);

      this.playersBanned = this.players
        ?.filter((p) => banInfosList.some((b) => b.SteamId === p.steamID64))
        .sort((a, b) => this._sortBannedPlayers(a, b));

      this.playersBannedAfter = this.playersBanned.filter(
        (p) =>
          // we take only people banned after playing with them
          p.banInfo && p.lastPlayWith && p.banInfo.LastBanOn > p.lastPlayWith
      );

      this.onStatisticsUpdated.next();
    }
  }

  /**
   * we sort player : the ones we did not scan yet, then the older scanned first
   */
  private _sortPlayers(playerA: PlayerInfo, playerB: PlayerInfo) {
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
  private _sortMatches(matchA: MatchInfo, matchB: MatchInfo) {
    return matchA.id! < matchB.id! ? -1 : 1;
  }

  /**
   * we sort by most recent bans first
   */
  private _sortBannedPlayers(playerA: PlayerInfo, playerB: PlayerInfo) {
    return playerA.banInfo!.DaysSinceLastBan < playerB.banInfo!.DaysSinceLastBan
      ? -1
      : 1;
  }

  private _updateMatchBanStatus(match: HTMLElement) {
    this.database.matches ??= [];
    const matchId = this._utilsService.getDateOfMatch(match);
    let matchInfo = this.database.matches.find((m) => m.id === matchId);

    for (let steamID64 of matchInfo!.playersSteamID64) {
      const playerInfo = this.database.players?.find(
        (p) => p.steamID64 === steamID64
      );
      const playerBannedColumn = document.querySelectorAll<HTMLElement>(
        `.banstatus[data-steamid64="${steamID64}"]`
      );
      if (playerInfo?.lastPlayWith && playerInfo?.banInfo) {
        const banInfo = playerInfo.banInfo;
        if (banInfo.NumberOfVACBans > 0 || banInfo.NumberOfGameBans > 0) {
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
            elt.classList.add('not-banned');
          }
        }
      }
    }
  }

  private _isOvertime(
    scoreA: number,
    scoreB: number,
    format: MatchFormat
  ): boolean {
    let isOvertime = false;
    switch (format) {
      case MatchFormat.MR12:
        isOvertime = scoreA >= 12 && scoreB >= 12;
        break;
    }
    return isOvertime;
  }

  private _isFinished(
    scoreA: number,
    scoreB: number,
    format: MatchFormat
  ): boolean {
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
    return teamScore > oppositeTeamScore
      ? 1
      : teamScore < oppositeTeamScore
      ? -1
      : 0;
  }
}
