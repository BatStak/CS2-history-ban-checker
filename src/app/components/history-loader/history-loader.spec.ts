import { DataService } from '../../../services/data.service';
import { DatabaseService } from '../../../services/database.service';
import { UtilsService } from '../../../services/utils.service';
import { HistoryLoaderComponent } from './history-loader.component';

describe('HistoryLoaderComponent', () => {
  const databaseService = new DatabaseService();
  const utilsService = new UtilsService();
  const dataService = new DataService(databaseService, utilsService);

  it('Test timer behavior', async () => {
    const comp = new HistoryLoaderComponent(utilsService, dataService);

    comp._buttonClickMaxAttempts = 1;
    comp._loadHistoryInternvalInMs = 100;

    // we add button to body so button offsetParent is OK
    comp._loadMoreButton = document.createElement('button');
    document.body.append(comp._loadMoreButton);

    comp.startLoadHistory();
    expect(utilsService.isLoadingHistory).toBeTrue();
    expect(comp._loadHistoryTimer).toBeDefined();
    expect(comp._buttonClickAttempts).toEqual(0);

    // we remove button to body so button offsetParent is KO
    document.body.removeChild(comp._loadMoreButton);

    // we wait for 1 cycle
    await utilsService.wait(comp._loadHistoryInternvalInMs);
    expect(utilsService.isLoadingHistory).toBeFalse();
    expect(comp._loadHistoryTimer).toBeUndefined();
    expect(comp._buttonClickAttempts).toEqual(1);
  });
});
