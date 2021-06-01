import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChooseStoreComponent } from './choose-store.component';

describe('ChooseStoreComponent', () => {
  let component: ChooseStoreComponent;
  let fixture: ComponentFixture<ChooseStoreComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChooseStoreComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChooseStoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
