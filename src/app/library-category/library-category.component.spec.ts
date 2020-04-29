import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryCategoryComponent } from './library-category.component';

describe('LibraryCategoryComponent', () => {
  let component: LibraryCategoryComponent;
  let fixture: ComponentFixture<LibraryCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
