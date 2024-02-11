import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataService } from '../../../services/data.service';
import { DatabaseService } from '../../../services/database.service';
import { UtilsService } from '../../../services/utils.service';
import { HistoryLoaderComponent } from './history-loader.component';

describe('HistoryLoaderComponent', () => {
  let component: HistoryLoaderComponent;
  let utilsService: UtilsService;
  let dataService: DataService;
  let fixture: ComponentFixture<HistoryLoaderComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HistoryLoaderComponent],
      providers: [DatabaseService, UtilsService, DataService],
    });
    fixture = TestBed.createComponent(HistoryLoaderComponent);
    component = fixture.componentInstance;
    utilsService = fixture.debugElement.injector.get(UtilsService);
    dataService = fixture.debugElement.injector.get(DataService);
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
});
