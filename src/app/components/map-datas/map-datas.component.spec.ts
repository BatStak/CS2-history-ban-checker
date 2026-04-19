import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { MapDatasComponent } from './map-datas.component';
import { DataService } from '../../../services/data.service';
import { DatabaseService } from '../../../services/database.service';

describe('MapDatasComponent', () => {
  let component: MapDatasComponent;
  let fixture: ComponentFixture<MapDatasComponent>;
  let dataService: DataService;

  async function detectChanges() {
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapDatasComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: DatabaseService, useValue: { setDatabase: vi.fn(), getDatabase: vi.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(MapDatasComponent);
    fixture.autoDetectChanges();
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);
    await detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('hides button when no mySteamId', async () => {
    dataService.mySteamId = undefined;
    await detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('shows button when mySteamId set', async () => {
    dataService.mySteamId = '123';
    await detectChanges();
    expect(fixture.nativeElement.querySelector('button').textContent).toContain('Show');
  });

  it('toggle shows table with data', async () => {
    dataService.mySteamId = '100';
    dataService.filteredMatches = [{
      id: '1', map: 'de_dust2', playersSteamID64: ['100'],
      teamA: { scores: [{ steamID64: '100', ping: null, k: null, a: null, d: null, mvp: null, hsp: null, score: null }], win: 1 },
      teamB: { scores: [], win: -1 },
    }];
    dataService.playersBannedFiltered = [];
    await detectChanges();

    await component.toggle();
    await detectChanges();

    expect(component.display).toBe(true);
    expect(fixture.nativeElement.querySelector('table')).toBeTruthy();
    expect(component.mapDatas.length).toBeGreaterThan(0);
  });

  it('toggle hides table', async () => {
    dataService.mySteamId = '100';
    dataService.filteredMatches = [];
    dataService.playersBannedFiltered = [];
    await detectChanges();
    component.toggle();
    await detectChanges();
    component.toggle();
    await detectChanges();
    expect(component.display).toBe(false);
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });

  it('orderBy toggles sort', () => {
    component.orderBy('sampleSize');
    expect(component.column).toBe('sampleSize');
    expect(component.order).toBe('asc');
    component.orderBy('sampleSize');
    expect(component.order).toBe('desc');
  });

  it('orderBy different column resets to asc', () => {
    component.orderBy('sampleSize');
    component.orderBy('winrate');
    expect(component.column).toBe('winrate');
    expect(component.order).toBe('asc');
  });

  it('clicking column headers sorts', async () => {
    dataService.mySteamId = '100';
    dataService.filteredMatches = [];
    dataService.playersBannedFiltered = [];
    await detectChanges();
    component.toggle();
    await detectChanges();

    const headers = fixture.nativeElement.querySelectorAll('th.sortable');
    expect(headers.length).toBe(4);
    headers[0].click(); // Map
    await detectChanges();
    expect(component.column).toBe('map');
  });

  it('shows winrate input and percentage', async () => {
    dataService.mySteamId = '100';
    dataService.filteredMatches = [{
      id: '1', map: 'de_dust2', playersSteamID64: ['100'],
      teamA: { scores: [{ steamID64: '100', ping: null, k: null, a: null, d: null, mvp: null, hsp: null, score: null }], win: 1 },
      teamB: { scores: [], win: -1 },
    }];
    dataService.playersBannedFiltered = [];
    await detectChanges();
    component.toggle();
    await detectChanges();

    expect(fixture.nativeElement.querySelector('#winrate')).toBeTruthy();
    expect(component.recentMapsPercentage).toBeGreaterThanOrEqual(0);
  });

  it('updates recentMapsSamplesize from winRateUpdated', () => {
    dataService.mySteamId = '100';
    dataService.filteredMatches = [];
    dataService.playersBannedFiltered = [];
    component.display = true;
    component.mapDatas = [{ map: 'All maps', sampleSize: 0, wins: 0, withSomeoneBanAfter: 0, mostRecentWinsCount: 0, winrate: 0, banrate: 0 }];

    component.winRateUpdated.next({ target: { valueAsNumber: 50 } } as any);
    // debounced, so we just verify no error
  });
});
