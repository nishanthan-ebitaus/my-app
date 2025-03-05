import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IrpCredentialsComponent } from './irp-credentials.component';

describe('IrpCredentialsComponent', () => {
  let component: IrpCredentialsComponent;
  let fixture: ComponentFixture<IrpCredentialsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IrpCredentialsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IrpCredentialsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
