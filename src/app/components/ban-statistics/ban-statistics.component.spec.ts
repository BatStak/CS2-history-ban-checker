import { DataService } from '../../../services/data.service';
import { DatabaseService } from '../../../services/database.service';
import { UtilsService } from '../../../services/utils.service';
import { BanStatisticsComponent } from './ban-statistics.component';

describe('BanStatisticsComponent', () => {
  const databaseService = new DatabaseService();
  const utilsService = new UtilsService();
  const dataService = new DataService(databaseService, utilsService);

  it('Test update', () => {
    const comp = new BanStatisticsComponent(dataService);

    // we add 100 players in database
    dataService.players = [];
    for (let i = 0; i < 100; i++) {
      dataService.players.push({
        matches: [],
        steamID64: `steamID${i}`,
      });
    }

    // we add 10 banned players in database
    dataService.playersBannedAfter = [];
    for (let i = 0; i < 10; i++) {
      dataService.playersBannedAfter.push({
        matches: [],
        steamID64: `steamID${i}`,
      });
    }

    // we add 100 matches in database
    dataService.matches = [];
    for (let i = 0; i < 100; i++) {
      dataService.matches.push({
        playersSteamID64: [],
      });
    }

    // 10% of players, 0 match concerned
    comp._update();
    expect(comp.playersCount).toEqual(100);
    expect(comp.matchesCount).toEqual(100);
    expect(comp.bannedCount).toEqual(10);
    expect(comp.matchesConcerned).toEqual(0);
    expect(comp.bannedPourcentage).toEqual(10);
    expect(comp.matchPourcentage).toEqual(0);

    // 1 match concerned (1%) of 100 matches
    dataService.matches[0].playersSteamID64.push('steamID0');
    comp._update();
    expect(comp.playersCount).toEqual(100);
    expect(comp.matchesCount).toEqual(100);
    expect(comp.bannedCount).toEqual(10);
    expect(comp.matchesConcerned).toEqual(1);
    expect(comp.matchPourcentage).toEqual(1);

    // 3 match concerned (6%) of 50 matches
    dataService.matches[1].playersSteamID64.push('steamID0');
    dataService.matches[2].playersSteamID64.push('steamID0');
    dataService.matches.splice(50, 50);
    comp._update();
    expect(comp.playersCount).toEqual(100);
    expect(comp.matchesCount).toEqual(50);
    expect(comp.bannedCount).toEqual(10);
    expect(comp.matchesConcerned).toEqual(3);
    expect(comp.matchPourcentage).toEqual(6);

    // 10 players out of 50 (20%)
    dataService.players.splice(50, 50);
    comp._update();
    expect(comp.playersCount).toEqual(50);
    expect(comp.matchesCount).toEqual(50);
    expect(comp.bannedCount).toEqual(10);
    expect(comp.bannedPourcentage).toEqual(20);

    // we now have 1050 players and 10 banned players (0.95%)
    for (let i = 0; i < 1000; i++) {
      dataService.players.push({
        matches: [],
        steamID64: `steamID-new-${i}`,
      });
    }
    comp._update();
    expect(comp.playersCount).toEqual(1050);
    expect(comp.matchesCount).toEqual(50);
    expect(comp.bannedCount).toEqual(10);
    expect(comp.bannedPourcentage).toEqual(0.95);

    // we now have 968 matches and 10 banned players (0.95%)
    for (let i = 0; i < 918; i++) {
      dataService.matches.push({
        playersSteamID64: [],
      });
    }
    comp._update();
    expect(comp.playersCount).toEqual(1050);
    expect(comp.matchesCount).toEqual(968);
    expect(comp.bannedCount).toEqual(10);
    expect(comp.matchesConcerned).toEqual(3);
    expect(comp.matchPourcentage).toEqual(0.31);
  });
});
