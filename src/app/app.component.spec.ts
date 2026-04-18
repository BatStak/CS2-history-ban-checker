import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatchFormat } from '../models';
import { DataService } from '../services/data.service';
import { MockDatabaseService } from '../services/data.service.spec';
import { DatabaseService } from '../services/database.service';
import { SteamService } from '../services/steam.service';
import { UtilsService } from '../services/utils.service';
import { AppComponent } from './app.component';

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
    fixture.detectChanges();
  });

  it('Test template logic', async () => {
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
    expect(dom.innerHTML).toContain('</cs2-history-loader>');

    component.isOnProfilePage = true;
    fixture.detectChanges();
    expect(dom.innerHTML).toContain('id="self-status"');
    expect(dom.innerHTML).not.toContain('</cs2-history-ban-scanner>');
    expect(dom.innerHTML).not.toContain('</cs2-history-ban-statistics>');
    expect(dom.innerHTML).not.toContain('</cs2-history-loader>');
  });

  it('Test typescript variables initialisation', async () => {
    await component.ngAfterViewInit();
    expect(component.format).toBeUndefined();

    window.history.replaceState(null, '', '?tab=toto');
    await component.ngAfterViewInit();
    expect(component.format).toBeUndefined();

    window.history.replaceState(null, '', '?tab=matchhistorypremier');
    await component.ngAfterViewInit();
    expect(component.format).toEqual(MatchFormat.MR12);

    window.history.replaceState(null, '', '?tab=matchhistorycompetitivepermap');
    await component.ngAfterViewInit();
    expect(component.format).toEqual(MatchFormat.MR12);

    window.history.replaceState(null, '', '?tab=matchhistorycompetitive');
    await component.ngAfterViewInit();
    expect(component.format).toEqual(MatchFormat.MR15);

    window.history.replaceState(null, '', '?tab=matchhistorywingman');
    await component.ngAfterViewInit();
    expect(component.format).toEqual(MatchFormat.MR8);

    window.history.replaceState(null, '', '');
  });
});
