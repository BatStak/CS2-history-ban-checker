import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataService } from '../../../services/data.service';
import { DatabaseService } from '../../../services/database.service';
import { UtilsService } from '../../../services/utils.service';
import { HistoryLoaderComponent } from './history-loader.component';

describe('HistoryLoaderComponent', async () => {
  let component: HistoryLoaderComponent;
  let utilsService: UtilsService;
  let dataService: DataService;
  let fixture: ComponentFixture<HistoryLoaderComponent>;
  let dom: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HistoryLoaderComponent],
      providers: [DatabaseService, UtilsService],
    });
    fixture = TestBed.createComponent(HistoryLoaderComponent);
    component = fixture.componentInstance;
    utilsService = fixture.debugElement.injector.get(UtilsService);
    dataService = fixture.debugElement.injector.get(DataService);
    dom = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('Test template logic', async () => {
    utilsService.isLoadingHistory = true;
    fixture.detectChanges();
    expect(dom.textContent).toContain('Loading...');
    expect(dom.textContent).toContain('No history loaded.');
    expect(dom.textContent).not.toContain('History loaded from');

    utilsService.isLoadingHistory = false;
    fixture.detectChanges();
    expect(dom.textContent).not.toContain('Loading...');
    expect(dom.textContent).toContain('No history loaded.');
    expect(dom.textContent).not.toContain('History loaded from');

    utilsService.startDate = '2015-02-02';
    fixture.detectChanges();
    expect(dom.textContent).toContain('No history loaded.');
    expect(dom.textContent).not.toContain('History loaded from');
    utilsService.startDate = undefined;
    utilsService.endDate = '2015-03-02';
    fixture.detectChanges();
    expect(dom.textContent).toContain('No history loaded.');
    expect(dom.textContent).not.toContain('History loaded from');

    utilsService.startDate = '2015-02-02';
    fixture.detectChanges();
    expect(dom.textContent).not.toContain('No history loaded.');
    expect(dom.textContent).toContain('History loaded from 02/02/2015 to 02/03/2015');
  });

  it('Test timer behavior', async () => {
    component._buttonClickMaxAttempts = 1;
    component._loadHistoryInternvalInMs = 100;

    // we add button to body so button offsetParent is OK
    component._loadMoreButton = document.createElement('button');
    document.body.append(component._loadMoreButton);

    component.startLoadHistory();
    expect(utilsService.isLoadingHistory).toBeTrue();
    expect(component._loadHistoryTimer).toBeDefined();
    expect(component._buttonClickAttempts).toEqual(0);

    // we remove button to body so button offsetParent is KO
    document.body.removeChild(component._loadMoreButton);

    // we wait for 1 cycle
    await utilsService.wait(component._loadHistoryInternvalInMs);
    expect(utilsService.isLoadingHistory).toBeFalse();
    expect(component._loadHistoryTimer).toBeUndefined();
    expect(component._buttonClickAttempts).toEqual(1);
  });

  it('Test checkbox behavior', async () => {
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'hide-history-table';
    const event: any = {
      target: checkbox,
    };

    checkbox.checked = false;
    await component.toggleHideCleanMatches(event);
    fixture.detectChanges();
    expect(component.hideHistoryTable).toBeFalse();
    expect(dataService.database.hideHistoryTable).toBeFalse();

    checkbox.checked = true;
    await component.toggleHideCleanMatches(event);
    fixture.detectChanges();
    expect(component.hideHistoryTable).toBeTrue();
    expect(dataService.database.hideHistoryTable).toBeTrue();
  });
});
