import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MapDatasComponent } from './map-datas.component';
import { DataService } from '../../../services/data.service';
import { DatabaseService } from '../../../services/database.service';

describe('MapDatasComponent', () => {
  let component: MapDatasComponent;
  let fixture: ComponentFixture<MapDatasComponent>;
  let dataService: DataService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MapDatasComponent],
      providers: [
        { provide: DatabaseService, useValue: { setDatabase: vi.fn(), getDatabase: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(MapDatasComponent);
    component = fixture.componentInstance;
    dataService = TestBed.inject(DataService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('toggle switches display', () => {
    expect(component.display).toBe(false);
    component.toggle();
    expect(component.display).toBe(true);
    component.toggle();
    expect(component.display).toBe(false);
  });

  it('orderBy toggles sort order', () => {
    component.orderBy('sampleSize');
    expect(component.column).toBe('sampleSize');
    expect(component.order).toBe('asc');

    component.orderBy('sampleSize');
    expect(component.order).toBe('desc');
  });

  it('does not show table when display is false', () => {
    expect(fixture.nativeElement.querySelector('table')).toBeNull();
  });

  it('hides toggle button when no mySteamId', () => {
    dataService.mySteamId = undefined;
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('shows toggle button when mySteamId is set', () => {
    dataService.mySteamId = '123';
    fixture.detectChanges();
    const button = fixture.nativeElement.querySelector('button');
    expect(button).toBeTruthy();
    expect(button.textContent).toContain('Show');
  });
});
