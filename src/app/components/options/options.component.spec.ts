import { ComponentFixture, TestBed } from '@angular/core/testing';
import { OptionsComponent } from './options.component';
import { DataService } from '../../../services/data.service';
import { UtilsService } from '../../../services/utils.service';
import { DatabaseService } from '../../../services/database.service';

describe('OptionsComponent', () => {
  let component: OptionsComponent;
  let fixture: ComponentFixture<OptionsComponent>;
  let dataService: DataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OptionsComponent],
      providers: [
        { provide: DatabaseService, useValue: { setDatabase: vi.fn(), getDatabase: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(OptionsComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('openOptions sets showOptions to true', () => {
    component.openOptions();
    expect(component.showOptions).toBe(true);
  });

  it('closeOptions saves apiKey and hides overlay', () => {
    component.showOptions = true;
    component.displayDisclaimer = true;
    component.displayMoreOptions = true;
    component.apiKey = 'my-key';
    vi.spyOn(dataService, 'save');

    component.closeOptions();

    expect(component.showOptions).toBe(false);
    expect(component.displayDisclaimer).toBe(false);
    expect(component.displayMoreOptions).toBe(false);
    expect(dataService.database.apiKey).toBe('my-key');
    expect(dataService.save).toHaveBeenCalled();
  });

  it('toggleDisclaimer toggles displayDisclaimer', () => {
    expect(component.displayDisclaimer).toBe(false);
    component.toggleDisclaimer();
    expect(component.displayDisclaimer).toBe(true);
    component.toggleDisclaimer();
    expect(component.displayDisclaimer).toBe(false);
  });

  it('renders set API key button', () => {
    const button = fixture.nativeElement.querySelector('#open-options');
    expect(button.textContent).toContain('Set');
  });

  it('renders change button when apiKey is set', () => {
    component.apiKey = 'some-key';
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('#open-options');
    expect(button.textContent).toContain('Change');
  });
});
