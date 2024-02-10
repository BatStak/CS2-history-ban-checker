import { Injectable } from '@angular/core';

@Injectable()
export class UtilsService {
  isLoadingHistory = false;
  isScanning = false;

  startDate?: string;
  endDate?: string;

  matchesCssSelector = '.csgo_scoreboard_root > tbody > tr:not(:first-child)';
  playersCssSelector = '.csgo_scoreboard_inner_right > tbody > tr';

  getMap(matchNode: HTMLElement) {
    return matchNode
      .querySelector<HTMLElement>(
        '.csgo_scoreboard_inner_left > tbody > tr:nth-child(1)'
      )
      ?.textContent?.trim()
      ?.replace('Premier ', '')
      ?.replace('Wingman ', '')
      ?.replace('Competitive ', '');
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
    const startMatch = document.querySelector<HTMLElement>(
      '.csgo_scoreboard_root > tbody > tr:not(:first-child):last-child'
    );
    if (startMatch) {
      this.startDate = this.getDateOfMatch(startMatch);
    }
    if (!this.endDate) {
      const endMatch = document.querySelector<HTMLElement>(
        '.csgo_scoreboard_root > tbody > tr:nth-child(2)'
      );
      if (endMatch) {
        this.endDate = this.getDateOfMatch(endMatch);
      }
    }
  }
}
