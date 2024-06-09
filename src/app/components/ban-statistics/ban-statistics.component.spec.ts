import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataService } from '../../../services/data.service';
import { DatabaseService } from '../../../services/database.service';
import { UtilsService } from '../../../services/utils.service';
import { BanStatisticsComponent } from './ban-statistics.component';

describe('BanStatisticsComponent', async () => {
  let component: BanStatisticsComponent;
  let dataService: DataService;
  let fixture: ComponentFixture<BanStatisticsComponent>;
  let dom: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [BanStatisticsComponent],
      providers: [DatabaseService, UtilsService, DataService],
    });
    fixture = TestBed.createComponent(BanStatisticsComponent);
    component = fixture.componentInstance;
    component.displayListOfBannedPlayers = true;
    dataService = fixture.debugElement.injector.get(DataService);
    dom = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('Test template no banned player', async () => {
    dataService.playersBannedFiltered = [];
    dataService.section = 'test';

    component._update();
    fixture.detectChanges();
    expect(dom.textContent).toContain('No banned player');

    dataService.playersBannedFiltered.push({
      matches: [],
      steamID64: 'test',
    });
    component._update();
    fixture.detectChanges();
    expect(dom.textContent).not.toContain('No banned player');
    expect(dom.textContent).toContain('1 have been banned after playing with you');
  });

  it('Test update', async () => {
    // we add 100 players in database
    dataService.filteredPlayers = [];
    for (let i = 0; i < 100; i++) {
      dataService.filteredPlayers.push({
        matches: [],
        steamID64: `steamID${i}`,
      });
    }

    // we add 10 banned players in database
    dataService.playersBannedFiltered = [];
    for (let i = 0; i < 10; i++) {
      dataService.playersBannedFiltered.push({
        matches: [],
        steamID64: `steamID${i}`,
      });
    }

    // we add 100 matches in database
    dataService.filteredMatches = [];
    for (let i = 0; i < 100; i++) {
      dataService.filteredMatches.push({
        playersSteamID64: [],
      });
    }

    // 10% of players, 0 match concerned
    component._update();
    expect(component.playersCount).toEqual(100);
    expect(component.matchesCount).toEqual(100);
    expect(component.bannedCount).toEqual(10);
    expect(component.matchesConcerned).toEqual(0);
    expect(component.bannedPourcentage).toEqual(10);
    expect(component.matchPourcentage).toEqual(0);

    // 1 match concerned (1%) of 100 matches
    dataService.filteredMatches[0].playersSteamID64.push('steamID0');
    component._update();
    expect(component.playersCount).toEqual(100);
    expect(component.matchesCount).toEqual(100);
    expect(component.bannedCount).toEqual(10);
    expect(component.matchesConcerned).toEqual(1);
    expect(component.matchPourcentage).toEqual(1);

    // 3 match concerned (6%) of 50 matches
    dataService.filteredMatches[1].playersSteamID64.push('steamID0');
    dataService.filteredMatches[2].playersSteamID64.push('steamID0');
    dataService.filteredMatches.splice(50, 50);
    component._update();
    expect(component.playersCount).toEqual(100);
    expect(component.matchesCount).toEqual(50);
    expect(component.bannedCount).toEqual(10);
    expect(component.matchesConcerned).toEqual(3);
    expect(component.matchPourcentage).toEqual(6);

    // 10 players out of 50 (20%)
    dataService.filteredPlayers.splice(50, 50);
    component._update();
    expect(component.playersCount).toEqual(50);
    expect(component.matchesCount).toEqual(50);
    expect(component.bannedCount).toEqual(10);
    expect(component.bannedPourcentage).toEqual(20);

    // we now have 1050 players and 10 banned players (0.95%)
    for (let i = 0; i < 1000; i++) {
      dataService.filteredPlayers.push({
        matches: [],
        steamID64: `steamID-new-${i}`,
      });
    }
    component._update();
    expect(component.playersCount).toEqual(1050);
    expect(component.matchesCount).toEqual(50);
    expect(component.bannedCount).toEqual(10);
    expect(component.bannedPourcentage).toEqual(0.95);

    // we now have 968 matches and 10 banned players (0.95%)
    for (let i = 0; i < 918; i++) {
      dataService.filteredMatches.push({
        playersSteamID64: [],
      });
    }
    component._update();
    expect(component.playersCount).toEqual(1050);
    expect(component.matchesCount).toEqual(968);
    expect(component.bannedCount).toEqual(10);
    expect(component.matchesConcerned).toEqual(3);
    expect(component.matchPourcentage).toEqual(0.31);
  });
});
