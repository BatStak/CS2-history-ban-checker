import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { OptionsComponent } from './options.component';
import { DataService } from '../../../services/data.service';
import { UtilsService } from '../../../services/utils.service';
import { DatabaseService } from '../../../services/database.service';

describe('OptionsComponent', () => {
  let component: OptionsComponent;
  let fixture: ComponentFixture<OptionsComponent>;
  let dataService: DataService;

  async function detectChanges() {
    fixture.changeDetectorRef.markForCheck();
    await fixture.whenStable();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OptionsComponent],
      providers: [
        provideZonelessChangeDetection(),
        { provide: DatabaseService, useValue: { setDatabase: vi.fn(), getDatabase: vi.fn() } },
      ],
    }).compileComponents();
    fixture = TestBed.createComponent(OptionsComponent);
    fixture.autoDetectChanges();
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);
    await detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('shows "Set" when no apiKey', () => {
    expect(fixture.nativeElement.querySelector('#open-options').textContent).toContain('Set');
  });

  it('shows "Change" when apiKey set', async () => {
    component.apiKey = 'key';
    await detectChanges();
    expect(fixture.nativeElement.querySelector('#open-options').textContent).toContain('Change');
  });

  it('shows first-time message when no apiKey', () => {
    expect(fixture.nativeElement.textContent).toContain('First, you need to enter');
  });

  it('hides first-time message when apiKey set', async () => {
    component.apiKey = 'key';
    await detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('First, you need to enter');
  });

  it('openOptions shows overlay', async () => {
    component.openOptions();
    await detectChanges();
    expect(fixture.nativeElement.querySelector('#overlay-options')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('#apikey')).toBeTruthy();
  });

  it('closeOptions hides overlay and saves', async () => {
    component.showOptions = true;
    component.displayDisclaimer = true;
    component.displayMoreOptions = true;
    component.apiKey = 'new-key';
    vi.spyOn(dataService, 'save');
    component.closeOptions();
    await detectChanges();
    expect(component.showOptions).toBe(false);
    expect(component.displayDisclaimer).toBe(false);
    expect(dataService.database.apiKey).toBe('new-key');
    expect(dataService.save).toHaveBeenCalled();
    expect(fixture.nativeElement.querySelector('#overlay-options')).toBeNull();
  });

  it('toggleDisclaimer shows/hides disclaimer', async () => {
    component.openOptions();
    await detectChanges();
    component.toggleDisclaimer();
    await detectChanges();
    expect(fixture.nativeElement.textContent).toContain("won't send it anywhere");
    component.toggleDisclaimer();
    await detectChanges();
    expect(component.displayDisclaimer).toBe(false);
  });

  it('shows more options with reset button', async () => {
    component.showOptions = true;
    component.displayMoreOptions = true;
    await detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button');
    const resetBtn = Array.from(buttons).find((b: any) => b.textContent.includes('Reset'));
    expect(resetBtn).toBeTruthy();
  });

  it('resetDatabase calls reset after confirm', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    vi.spyOn(dataService, 'reset').mockImplementation(async () => { });
    component.resetDatabase();
    expect(dataService.reset).toHaveBeenCalled();
  });

  it('resetDatabase does not call reset if cancelled', () => {
    vi.spyOn(window, 'confirm').mockReturnValue(false);
    vi.spyOn(dataService, 'reset').mockImplementation(async () => { });
    component.resetDatabase();
    expect(dataService.reset).not.toHaveBeenCalled();
  });

  it('disables button when loading', async () => {
    const utils = TestBed.inject(UtilsService);
    utils.isLoadingHistory = true;
    await detectChanges();
    expect(fixture.nativeElement.querySelector('#open-options').disabled).toBe(true);
  });
});
