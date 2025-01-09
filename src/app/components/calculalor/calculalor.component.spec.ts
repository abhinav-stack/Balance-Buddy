import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalculalorComponent } from './calculalor.component';

describe('CalculalorComponent', () => {
  let component: CalculalorComponent;
  let fixture: ComponentFixture<CalculalorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CalculalorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CalculalorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
