import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LibraryFavoritesComponent } from './library-favorites.component';

describe('LibraryFavoritesComponent', () => {
  let component: LibraryFavoritesComponent;
  let fixture: ComponentFixture<LibraryFavoritesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LibraryFavoritesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LibraryFavoritesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
