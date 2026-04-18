import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HistoryLoaderComponent } from './history-loader.component';
import { DataService } from '../../../services/data.service';
import { UtilsService } from '../../../services/utils.service';
import { DatabaseService } from '../../../services/database.service';

describe('HistoryLoaderComponent', () => {
  let component: HistoryLoaderComponent;
  let fixture: ComponentFixture<HistoryLoaderComponent>;
  let utilsService: UtilsService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HistoryLoaderComponent],
      providers: [
        { provide: DatabaseService, useValue: { setDatabase: vi.fn(), getDatabase: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HistoryLoaderComponent);
    component = fixture.componentInstance;
    utilsService = TestBed.inject(UtilsService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('startLoadHistory sets isLoadingHistory to true', () => {
    component.startLoadHistory();
    expect(utilsService.isLoadingHistory).toBe(true);
    component.stopLoadHistory(); // cleanup
  });

  it('stopLoadHistory sets isLoadingHistory to false', () => {
    component.startLoadHistory();
    component.stopLoadHistory();
    expect(utilsService.isLoadingHistory).toBe(false);
  });

  it('renders load and stop buttons', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons[0].textContent).toContain('Load history');
    expect(buttons[1].textContent).toContain('Stop');
  });

  it('shows "No history loaded" when no dates', () => {
    expect(fixture.nativeElement.textContent).toContain('No history loaded');
  });
});
