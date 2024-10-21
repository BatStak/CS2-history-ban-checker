import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class UtilsService {
  isLoadingHistory = false;
  hasRemovedHistoryLoaded = false;
  isScanning = false;

  startDate?: string;
  endDate?: string;

  matchesCssSelector = '.csgo_scoreboard_root > tbody > tr:not(:first-child)';
  matchesNotParsedCssSelector = `${this.matchesCssSelector}:not(.parsed)`;
  matchesParsedCssSelector = `${this.matchesCssSelector}.parsed`;
  playersCssSelector = '.csgo_scoreboard_inner_right > tbody > tr';
  mapCssSelector = '.csgo_scoreboard_inner_left > tbody > tr:nth-child(1)';
  friendsListCssSelector = '.persona[data-steamid]';

  async wait(timeInMs: number) {
    return new Promise<void>((resolve) => {
      setTimeout(() => resolve(), timeInMs);
    });
  }

  getMap(matchNode: HTMLElement) {
    return matchNode
      .querySelector<HTMLElement>(this.mapCssSelector)
      ?.textContent?.trim()
      ?.replace('Premier ', '')
      ?.replace('Wingman ', '')
      ?.replace('Competitive ', '')
      ?.trim();
  }

  getReplayLink(matchNode: HTMLElement) {
    const link = matchNode.querySelector<HTMLElement>('.csgo_scoreboard_btn_gotv')?.parentElement as HTMLLinkElement;
    return link?.href;
  }

  getDateOfMatch(matchNode: HTMLElement) {
    return matchNode
      .querySelector<HTMLElement>('.csgo_scoreboard_inner_left > tbody > tr:nth-child(2)')
      ?.textContent?.trim();
  }

  getSteamID64FromMiniProfileId(miniprofileId: string) {
    const number = parseInt(miniprofileId, 10);
    return miniprofileId && !isNaN(number) ? '76' + (number + 561197960265728) : '';
  }

  getHistoryPeriod() {
    const startMatch = document.querySelector<HTMLElement>(
      '.csgo_scoreboard_root > tbody > tr:not(:first-child):last-child',
    );
    if (startMatch) {
      const startDate = this.getDateOfMatch(startMatch);
      if (!this.startDate || (startDate && startDate < this.startDate)) {
        this.startDate = startDate;
      }
    }
    if (!this.endDate) {
      const endMatch = document.querySelector<HTMLElement>('.csgo_scoreboard_root > tbody > tr:nth-child(2)');
      if (endMatch) {
        this.endDate = this.getDateOfMatch(endMatch);
      }
    }
  }
}
