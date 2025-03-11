import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { ButtonComponent } from "@shared/ui/button/button.component";
import { UiOtpComponent } from "@shared/ui/otp/otp.component";

@Component({
  selector: 'auth-verify-otp',
  templateUrl: './verify-otp.component.html',
  styleUrls: ['./verify-otp.component.scss'],
  imports: [UiOtpComponent, ButtonComponent]
})
export class VerifyOtpComponent implements OnInit, OnChanges {
  otpValue: string = '';
  @Input() errorMessage: string = '';
  @Output() enteredOtp = new EventEmitter<string>();

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['errorMessage']) {
      this.errorMessage = changes['errorMessage'].currentValue;
      this.cdr.detectChanges();
    }
  }

  otpEntered(otp: string) {
    this.errorMessage = '';
    this.otpValue = otp;
  }

  submitOtp() {
    if (this.otpValue.length !== 6) {
      this.errorMessage = 'Invalid OTP';
      return;
    }

    this.enteredOtp.emit(this.otpValue);
  }
}
