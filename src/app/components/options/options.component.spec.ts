import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataService } from '../../../services/data.service';
import { MockDatabaseService } from '../../../services/data.service.spec';
import { DatabaseService } from '../../../services/database.service';
import { UtilsService } from '../../../services/utils.service';
import { OptionsComponent } from './options.component';

describe('OptionsComponent', async () => {
  let component: OptionsComponent;
  let utilsService: UtilsService;
  let dataService: DataService;
  let fixture: ComponentFixture<OptionsComponent>;
  let dom: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OptionsComponent],
      providers: [
        { provide: DatabaseService, useClass: MockDatabaseService },
        UtilsService,
        DataService,
      ],
    });
    fixture = TestBed.createComponent(OptionsComponent);
    component = fixture.componentInstance;
    utilsService = fixture.debugElement.injector.get(UtilsService);
    dataService = fixture.debugElement.injector.get(DataService);
    dom = fixture.nativeElement;
  });

  it('Test template logic', async () => {
    fixture.detectChanges();
    expect(dom.textContent).toContain('Set API key');
    expect(dom.textContent).not.toContain('Change API key');
    expect(dom.textContent).not.toContain('Enter your API key');
    expect(dom.textContent).toContain(
      'First, you need to set an API key to be able to check BAN status of players'
    );

    component.apiKey = 'test';
    fixture.detectChanges();
    expect(dom.textContent).not.toContain('Set API key');
    expect(dom.textContent).toContain('Change API key');
    expect(dom.textContent).not.toContain('Enter your API key');
    expect(dom.textContent).not.toContain(
      'First, you need to set an API key to be able to check BAN status of players'
    );

    component.openOptions();
    expect(component.showOptions).toBeTrue();
    fixture.detectChanges();
    expect(dom.textContent).toContain('Enter your API key');

    component.closeOptions();
    expect(component.showOptions).toBeFalse();
  });
});
