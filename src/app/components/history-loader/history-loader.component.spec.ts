import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoryLoaderComponent } from './history-loader.component';
import { DataService } from '../../../services/data.service';
import { UtilsService } from '../../../services/utils.service';
import { DatabaseService } from '../../../services/database.service';

describe('HistoryLoaderComponent', () => {
  let component: HistoryLoaderComponent;
  let fixture: ComponentFixture<HistoryLoaderComponent>;
  let utilsService: UtilsService;
  let dataService: DataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryLoaderComponent],
      providers: [{ provide: DatabaseService, useValue: { setDatabase: vi.fn(), getDatabase: vi.fn() } }],
    }).compileComponents();
    fixture = TestBed.createComponent(HistoryLoaderComponent);
    component = fixture.componentInstance;
    utilsService = TestBed.inject(UtilsService);
    dataService = TestBed.inject(DataService);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('shows "No history loaded" when no dates', () => {
    expect(fixture.nativeElement.textContent).toContain('No history loaded');
  });

  it('shows date range when dates set', () => {
    utilsService.startDate = '2024-01-01 00:00:00 GMT';
    utilsService.endDate = '2024-06-01 00:00:00 GMT';
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('History loaded from');
  });

  it('shows Loading when isLoadingHistory', () => {
    utilsService.isLoadingHistory = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Loading...');
  });

  it('startLoadHistory sets flag and starts interval', () => {
    component.startLoadHistory();
    expect(utilsService.isLoadingHistory).toBe(true);
    component.stopLoadHistory();
  });

  it('stopLoadHistory clears interval', () => {
    component.startLoadHistory();
    component.stopLoadHistory();
    expect(utilsService.isLoadingHistory).toBe(false);
    expect(component.loadHistoryTimer).toBeUndefined();
  });

  it('toggleHideCleanMatches updates database', async () => {
    vi.spyOn(dataService, 'save');
    const event = { target: { checked: true } } as any;
    await component.toggleHideCleanMatches(event);
    expect(component.hideHistoryTable).toBe(true);
    expect(dataService.database.hideHistoryTable).toBe(true);
    expect(dataService.save).toHaveBeenCalled();
  });

  it('toggleHideCleanMatches cleans matches when loading', async () => {
    utilsService.isLoadingHistory = true;
    vi.spyOn(dataService, 'save');
    vi.spyOn(dataService, 'cleanParsedMatches');
    const event = { target: { checked: true } } as any;
    await component.toggleHideCleanMatches(event);
    expect(dataService.cleanParsedMatches).toHaveBeenCalled();
  });

  it('toggleHideCleanMatches does nothing without target', async () => {
    await component.toggleHideCleanMatches({} as any);
    // no error
  });

  it('_clickOnMoreButton increments attempts when button not visible', () => {
    component.loadMoreButton = null;
    component.buttonClickAttempts = 0;
    component.clickOnMoreButton();
    expect(component.buttonClickAttempts).toBe(1);
  });

  it('_clickOnMoreButton stops after max attempts', () => {
    component.loadMoreButton = null;
    component.buttonClickAttempts = 9;
    utilsService.isLoadingHistory = true;
    component.clickOnMoreButton();
    expect(utilsService.isLoadingHistory).toBe(false);
  });

  it('disables buttons correctly', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons[0].disabled).toBe(false); // Load
    expect(buttons[1].disabled).toBe(true);  // Stop (not loading)
  });
});
