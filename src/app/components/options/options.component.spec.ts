import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataService } from '../../../services/data.service';
import { DatabaseService } from '../../../services/database.service';
import { UtilsService } from '../../../services/utils.service';
import { OptionsComponent } from './options.component';

describe('OptionsComponent', () => {
  let component: OptionsComponent;
  let utilsService: UtilsService;
  let dataService: DataService;
  let fixture: ComponentFixture<OptionsComponent>;
  let dom: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [OptionsComponent],
      providers: [DatabaseService, UtilsService, DataService],
    });
    fixture = TestBed.createComponent(OptionsComponent);
    component = fixture.componentInstance;
    utilsService = fixture.debugElement.injector.get(UtilsService);
    dataService = fixture.debugElement.injector.get(DataService);
    dom = fixture.nativeElement;
  });

  it('Test template logic', () => {
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

    component.showOptions = true;
    fixture.detectChanges();
    expect(dom.textContent).toContain('Enter your API key');
  });
});
