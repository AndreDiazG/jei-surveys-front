import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SurveyEdit } from './survey-edit';

describe('SurveyEdit', () => {
  let component: SurveyEdit;
  let fixture: ComponentFixture<SurveyEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SurveyEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SurveyEdit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
