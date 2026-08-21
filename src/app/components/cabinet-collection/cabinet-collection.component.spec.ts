import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { CabinetStore } from '../../stores/cabinet-store';
import { CabinetCollectionComponent } from './cabinet-collection.component';

describe('CabinetCollectionComponent', () => {
  let component: CabinetCollectionComponent;
  let fixture: ComponentFixture<CabinetCollectionComponent>;

  beforeEach(async () => {
    sessionStorage.clear();
    await TestBed.configureTestingModule({
      imports: [CabinetCollectionComponent],
      providers: [CabinetStore, provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(CabinetCollectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    sessionStorage.clear();
  });

  it('should create and list catalog bottle ids only', () => {
    expect(component).toBeTruthy();
    expect(component.bottles().length).toBeGreaterThan(0);
    expect(component.bottles().every((bottle) => bottle.id.startsWith('bottle-'))).toBeTrue();
  });
});
