import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ScannerComponent } from './ban-scanner.component';
import { DataService } from '../../../services/data.service';
import { SteamService } from '../../../services/steam.service';
import { UtilsService } from '../../../services/utils.service';
import { DatabaseService } from '../../../services/database.service';

describe('ScannerComponent', () => {
  let component: ScannerComponent;
  let fixture: ComponentFixture<ScannerComponent>;
  let dataService: DataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ScannerComponent],
      providers: [
        { provide: DatabaseService, useValue: { setDatabase: vi.fn(), getDatabase: vi.fn() } },
        {
          provide: SteamService,
          useValue: { scanPlayers: vi.fn().mockResolvedValue([]) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ScannerComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('_calcNumberOfPages calculates correctly', () => {
    component.calcNumberOfPages(new Array(250));
    expect(component.numberOfPages).toBe(3);

    component.calcNumberOfPages(new Array(100));
    expect(component.numberOfPages).toBe(1);

    component.calcNumberOfPages([]);
    expect(component.numberOfPages).toBe(0);
  });

  it('stopScan sets _stopScan flag', () => {
    component.stopScan();
    expect(component.scanStopped).toBe(true);
  });

  it('_handleDeletedProfiles marks missing players as deleted', () => {
    dataService.database.players = [
      { steamID64: '1', matches: [] },
      { steamID64: '2', matches: [] },
    ];
    const apiResults = [{ SteamId: '1' }] as any;

    component.handleDeletedProfiles(apiResults, ['1', '2']);

    expect(dataService.database.players[1].deleted).toBe(true);
    expect(dataService.database.players[0].deleted).toBeUndefined();
  });

  it('renders scan buttons', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });
});
