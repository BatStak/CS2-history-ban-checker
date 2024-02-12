import { ApplicationRef } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DataService } from '../services/data.service';
import { DatabaseService } from '../services/database.service';
import { SteamService } from '../services/steam.service';
import { UtilsService } from '../services/utils.service';
import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let component: AppComponent;
  let utilsService: UtilsService;
  let dataService: DataService;
  let fixture: ComponentFixture<AppComponent>;
  let dom: HTMLElement;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [AppComponent],
      providers: [
        DatabaseService,
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

  it('Test template logic', () => {
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
});
