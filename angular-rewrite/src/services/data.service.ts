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
  onReady = new Subject<void>();
  onSave = new Subject<void>();
  onStatisticsUpdated = new Subject<void>();
  onReset = new Subject<void>();

  database: Database = {};

  hasPeopleNotScannedYet = false;
  oldestScan?: BanInfo;
  mostRecentScan?: BanInfo;
  oldestMatch?: MatchInfo;

  playersBanned: PlayerInfo[] = [];
  playersBannedAfter: PlayerInfo[] = [];

  constructor(private _utilsService: UtilsService) {
    this.onSave.pipe(debounceTime(1000)).subscribe(() => {
      this.save();
    });
  }

  init(database?: any) {
    this.database = database;
    this.database ??= {};
    this.database.matches ??= [];
    this.database.players ??= [];
    this._updateStatistics();
  }

  reset() {
    const matches = document.querySelectorAll<HTMLElement>(
      `${this._utilsService.matchesCssSelector}.parsed`
    );

    // we delete everything element we added and class "parsed"
    for (let match of Array.from(matches)) {
      const players = match.querySelectorAll(
        this._utilsService.playersCssSelector
      );
      for (let playerRow of Array.from(players)) {
        if (playerRow.children.length > 1) {
          playerRow.children[playerRow.children.length - 1].remove();
        }
      }
      match.classList.remove('parsed', 'banned');
    }

    // we remove storage but keep apiKey
    chrome.storage.local.clear();
    this.database = {
      apiKey: this.database.apiKey,
    };
    this.init();

    this.onReset.next();
  }

  parseMatches(format: MatchFormat) {
    const matches = document.querySelectorAll<HTMLElement>(
      `${this._utilsService.matchesCssSelector}:not(.parsed)`
    );
    for (let match of Array.from(matches)) {
      this._parseMatch(match, format);
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

          if (matchInfo!.format === MatchFormat.MR24 && scoreA + scoreB > 24) {
            matchInfo!.overtime = true;
          }
          matchInfo!.finished = this._isFinished(scoreA, scoreB, format);
        }
      }
    }

    match.classList.add('parsed');
  }

  private _updateStatistics() {
    if (this.database.players) {
      this.database.players.sort((a, b) => this._sortPlayers(a, b));
      console.log(this.database.players);

      this.hasPeopleNotScannedYet = this.database.players.some(
        (p) => !p.banInfo?.LastFetch
      );
      const playersScanned = this.database.players.filter(
        (p) => p.banInfo?.LastFetch
      );
      if (playersScanned.length) {
        this.oldestScan = playersScanned[0].banInfo;
        this.mostRecentScan = playersScanned[playersScanned.length - 1].banInfo;
      }

      this.database.matches?.sort((a, b) => this._sortMatches(a, b));
      this.oldestMatch = this.database.matches?.[0];

      const banInfosList = this.database.players
        .filter(
          (p) =>
            p.banInfo &&
            p.lastPlayWith &&
            (p.banInfo.NumberOfGameBans > 0 || p.banInfo.NumberOfVACBans > 0)
        )
        .map((p) => p.banInfo!);

      this.playersBanned = this.database.players
        ?.filter((p) => banInfosList.some((b) => b.SteamId === p.steamID64))
        .sort((a, b) => this._sortBannedPlayers(a, b));

      this.playersBannedAfter = this.playersBanned.filter(
        (p) =>
          // we take only people banned after playing with them
          p.banInfo && p.lastPlayWith && p.banInfo.LastBanOn > p.lastPlayWith
      );

      this._updateBanStatus();

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

  private _updateBanStatus() {
    const matches = document.querySelectorAll<HTMLElement>(
      `${this._utilsService.matchesCssSelector}.parsed`
    );
    for (let match of Array.from(matches)) {
      this._updateMatchBans(match);
    }
  }

  private _updateMatchBans(match: HTMLElement) {
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
          text += `<br />last is ${banInfo.DaysSinceLastBan} days ago`;
          for (let elt of Array.from(playerBannedColumn)) {
            elt.innerHTML = text;
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
            elt.innerHTML = 'clean';
            elt.classList.add('not-banned');
          }
        }
      }
    }
  }

  private _isFinished(
    scoreA: number,
    scoreB: number,
    format: MatchFormat
  ): boolean {
    if (format === MatchFormat.MR24) {
      if (scoreA === scoreB && scoreA === 15) {
        return true;
      }
      return scoreA !== scoreB && (scoreA === 13 || scoreB === 13);
    } else {
      if (scoreA === scoreB && scoreA === 8) {
        return true;
      }
      return scoreA !== scoreB && (scoreA === 9 || scoreB === 9);
    }
  }

  private _getWin(teamScore: number, oppositeTeamScore: number) {
    return teamScore > oppositeTeamScore
      ? 1
      : teamScore < oppositeTeamScore
      ? -1
      : 0;
  }
}
