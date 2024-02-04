import { Injectable } from '@angular/core';
import { Database, MatchFormat } from '../models';

@Injectable()
export class UtilsService {
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
}
