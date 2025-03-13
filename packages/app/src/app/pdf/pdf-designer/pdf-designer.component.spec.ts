import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PdfDesignerComponent } from './pdf-designer.component';

describe('PdfDesignerComponent', () => {
  let component: PdfDesignerComponent;
  let fixture: ComponentFixture<PdfDesignerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PdfDesignerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PdfDesignerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
