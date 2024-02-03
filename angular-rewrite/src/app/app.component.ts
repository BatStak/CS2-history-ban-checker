import { AfterViewInit, Component } from '@angular/core';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  interval?: any;
  historyInterval = 500;

  startDate?: string;
  endDate?: string;

  private _matchesCssSelector =
    '.csgo_scoreboard_root > tbody > tr:not(:first-child)';

  ngAfterViewInit(): void {
    this._observeNewMatches();
  }

  loadHistory() {
    let historyButtonAttemps = 0;
    const button =
      document.querySelector<HTMLButtonElement>('#load_more_button');
    this.interval = setInterval(() => {
      if (button && button.offsetParent !== null) {
        historyButtonAttemps = 0;
        button.click();
      } else {
        historyButtonAttemps++;
        if (historyButtonAttemps > 5) {
          this.stopLoadHistory();
        }
      }
    }, this.historyInterval);
  }

  stopLoadHistory() {
    clearInterval(this.interval);
    this.interval = undefined;
  }

  private _formatTables() {
    const matches = document.querySelectorAll<HTMLElement>(
      `${this._matchesCssSelector}:not(.formatted)`
    );
    matches.forEach((match) => {
      const players = match.querySelectorAll(
        '.csgo_scoreboard_inner_right > tbody > tr'
      );

      players.forEach((player, index) => {
        // not the score
        if (player.children.length > 1) {
          const lastColumn = player.children[player.children.length - 1];
          lastColumn.after(lastColumn.cloneNode(true));
          const newColumn = player.children[player.children.length - 1];
          if (index === 0) {
            newColumn.textContent = 'Ban?';
          } else {
            newColumn.textContent = '-';
          }
        }
      });

      match.classList.add('formatted');
    });
  }

  private _getHistoryPeriod() {
    const matches = document.querySelectorAll<HTMLElement>(
      this._matchesCssSelector
    );
    if (matches.length) {
      this.endDate = this._getDateOfMatch(matches[0]);
      this.startDate = this._getDateOfMatch(matches[matches.length - 1]);
    }
  }

  private _getDateOfMatch(matchNode: HTMLElement) {
    return matchNode
      .querySelector<HTMLElement>(
        '.csgo_scoreboard_inner_left > tbody > tr:nth-child(2)'
      )
      ?.textContent?.trim()
      .substring(0, 10);
  }

  private _observeNewMatches() {
    const results = document.querySelector('.csgo_scoreboard_root > tbody');
    if (results) {
      const observer = new MutationObserver(() => {
        this._formatTables();
        this._getHistoryPeriod();
      });
      observer.observe(results, { childList: true });
    }
  }
}
