import { Injectable } from '@angular/core';

@Injectable()
export class UtilsService {
  isLoadingHistory = false;
  isScanning = false;

  startDate?: string;
  endDate?: string;

  matchesCssSelector = '.csgo_scoreboard_root > tbody > tr:not(:first-child)';

  getMap(matchNode: HTMLElement) {
    return matchNode
      .querySelector<HTMLElement>(
        '.csgo_scoreboard_inner_left > tbody > tr:nth-child(1)'
      )
      ?.textContent?.trim()
      ?.replace('Premier ', '');
  }

  getReplayLink(matchNode: HTMLElement) {
    const link = matchNode.querySelector<HTMLElement>(
      '.csgo_scoreboard_btn_gotv'
    )?.parentElement as HTMLLinkElement;
    return link?.href;
  }

  getDateOfMatch(matchNode: HTMLElement) {
    return matchNode
      .querySelector<HTMLElement>(
        '.csgo_scoreboard_inner_left > tbody > tr:nth-child(2)'
      )
      ?.textContent?.trim();
  }

  getSteamID64FromMiniProfileId(miniprofileId: string) {
    return '76' + (parseInt(miniprofileId, 10) + 561197960265728);
  }

  getHistoryPeriod() {
    const matches = document.querySelectorAll<HTMLElement>(
      this.matchesCssSelector
    );
    if (matches.length) {
      this.endDate = this.getDateOfMatch(matches[0]);
      this.startDate = this.getDateOfMatch(matches[matches.length - 1]);
    }
  }
}
