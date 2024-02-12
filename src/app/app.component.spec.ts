import { ApplicationRef, Injectable } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Database, MatchFormat } from '../models';
import { DataService } from '../services/data.service';
import { DatabaseService } from '../services/database.service';
import { SteamService } from '../services/steam.service';
import { UtilsService } from '../services/utils.service';
import { AppComponent } from './app.component';

@Injectable()
class MockDatabaseService extends DatabaseService {
  override async getDatabase(): Promise<{ [key: string]: any }> {
    return {};
  }

  override async setDatabase(database: Database): Promise<void> {
    return;
  }
}

describe('AppComponent', async () => {
  let component: AppComponent;
  let utilsService: UtilsService;
  let dataService: DataService;
  let fixture: ComponentFixture<AppComponent>;
  let dom: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        { provide: DatabaseService, useClass: MockDatabaseService },
        UtilsService,
        DataService,
        SteamService,
        ApplicationRef,
      ],
    });
    fixture = TestBed.createComponent(AppComponent);
    component = fixture.componentInstance;
    utilsService = fixture.debugElement.injector.get(UtilsService);
    dataService = fixture.debugElement.injector.get(DataService);
    dom = fixture.nativeElement;
  });

  it('Test template logic', async () => {
    fixture.detectChanges();
    expect(dom.textContent).not.toContain('CS2 History Ban Checker');
    expect(dom.innerHTML).not.toContain('</cs2-history-ban-scanner>');
    expect(dom.innerHTML).not.toContain('</cs2-history-ban-statistics>');
    expect(dom.innerHTML).not.toContain('</cs2-history-loader>');

    component.ready = true;
    fixture.detectChanges();
    expect(dom.textContent).toContain('CS2 History Ban Checker');
    expect(dom.innerHTML).not.toContain('</cs2-history-ban-scanner>');
    expect(dom.innerHTML).not.toContain('</cs2-history-ban-statistics>');
    expect(dom.innerHTML).not.toContain('</cs2-history-loader>');

    dataService.database.apiKey = 'test';
    fixture.detectChanges();
    expect(dom.innerHTML).toContain('</cs2-history-ban-scanner>');
    expect(dom.innerHTML).toContain('</cs2-history-ban-statistics>');
    expect(dom.innerHTML).not.toContain('</cs2-history-loader>');

    component.isOnGCPDSection = true;
    fixture.detectChanges();
    expect(dom.innerHTML).toContain('</cs2-history-ban-scanner>');
    expect(dom.innerHTML).toContain('</cs2-history-ban-statistics>');
    expect(dom.innerHTML).toContain('</cs2-history-loader>');
  });

  it('Test typescript variables initialisation', async () => {
    component.ngAfterViewInit();
    component.ngDoCheck();
    expect(component.isOnGCPDSection).toBeFalse();
    expect(component.addMarginClass).toBeTrue();
    expect(component._format).toBeUndefined();

    window.history.replaceState(null, '', '?tab=toto');
    component.ngAfterViewInit();
    component.ngDoCheck();
    expect(component.isOnGCPDSection).toBeFalse();
    expect(component.addMarginClass).toBeTrue();
    expect(component._format).toBeUndefined();

    window.history.replaceState(null, '', '?tab=matchhistorypremier');
    component.ngAfterViewInit();
    component.ngDoCheck();
    expect(component.isOnGCPDSection).toBeTrue();
    expect(component.addMarginClass).toBeFalse();
    expect(component._format).toEqual(MatchFormat.MR12);

    window.history.replaceState(null, '', '?tab=matchhistorycompetitivepermap');
    component.ngAfterViewInit();
    component.ngDoCheck();
    expect(component.isOnGCPDSection).toBeTrue();
    expect(component.addMarginClass).toBeFalse();
    expect(component._format).toEqual(MatchFormat.MR12);

    window.history.replaceState(null, '', '?tab=matchhistorycompetitive');
    component.ngAfterViewInit();
    component.ngDoCheck();
    expect(component.isOnGCPDSection).toBeTrue();
    expect(component.addMarginClass).toBeFalse();
    expect(component._format).toEqual(MatchFormat.MR15);

    window.history.replaceState(null, '', '?tab=matchhistorywingman');
    component.ngAfterViewInit();
    component.ngDoCheck();
    expect(component.isOnGCPDSection).toBeTrue();
    expect(component.addMarginClass).toBeFalse();
    expect(component._format).toEqual(MatchFormat.MR8);
  });
});
