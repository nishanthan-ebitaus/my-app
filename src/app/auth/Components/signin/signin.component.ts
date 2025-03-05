import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiResponse, ApiStatus } from '@src/app/core/models/api-response.model';
import { Observable, Subject, takeUntil } from 'rxjs';
import { SigninStep } from '../../auth.model';
import { AuthService } from '../../auth.service';

@Component({
  selector: 'app-signin',
  standalone: false,
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss'
})
export class SigninComponent implements OnInit, OnDestroy {
  userEmail = 'cTest01@ebitaus.com';
  emailError = '';
  userOtp!: string;
  otpError = '';
  resendTimer$!: Observable<number>;
  signInFormStep!: SigninStep;

  private destroy$ = new Subject<void>();

  constructor(private signinService: AuthService, private router: Router) { }

  ngOnInit() {
    this.resendTimer$ = this.signinService.startResendTimer();

    this.signinService.signinStep$
      .pipe(takeUntil(this.destroy$))
      .subscribe(step => {
        this.signInFormStep = step;
        if (step === SigninStep.EMAIL_VERIFICATION) {
          this.signinService.clearResendInterval();
        }
      });
  }

  maskEmail(email: string): string {
    const parts = email.split("@");
    if (parts.length !== 2) return email;

    const username = parts[0].toLowerCase();
    const domain = parts[1].split(".");

    return `${username}*****.${domain[domain.length - 1]}`;
  }

  onOtpEntered(otp: string) {
    console.log(otp);
    this.userOtp = otp;
  }

  submitEmail() {
    if (this.userEmail === '') {
      this.emailError = 'Email is required';
      return;
    }

    if (!this.signinService.validateEmail(this.userEmail)) {
      this.emailError = 'Invalid email';
      return;
    }

    this.emailError = '';
    this.handleSignin();
  }

  handleSignin() {
    // this.signinService.setSigninStep(SigninStep.OTP_VERIFICATION);
    this.signinService.signin({ username: this.userEmail }).subscribe({
      next: (response: ApiResponse<any>) => {
        const { status, message } = response;
        if (status === ApiStatus.SUCCESS) {
          console.log("succeess");
          this.signinService.setSigninStep(SigninStep.OTP_VERIFICATION);
        } else if (response.status === ApiStatus.FAIL) {
          if (message === 'User is not present') {
            this.emailError = message;
            // this.router.navigate(['/auth/signup'], { replaceUrl: true })
            return;
          }

          if (message?.includes("You reached max attempt")) {
            this.emailError = message;
            return;
          }
        }
      },
      error: (err) => {
        console.error('An error occurred. Please try again.', err);
      }
    });
  }

  resendLoginOtp() {
    this.resendTimer$.subscribe((timerValue) => {
      console.log(timerValue)
      if (timerValue === 0) {
        this.signinService.signin({ username: this.userEmail }).subscribe({
          next: (response: ApiResponse<any>) => {
            const { status, message } = response;
            if (status === ApiStatus.SUCCESS) {
              console.log("succeess");
              // this.signinService.setSigninStep(SigninStep.OTP_VERIFICATION);
            } else if (response.status === ApiStatus.FAIL) {
              if (message === 'User is not present') {
                this.router.navigate(['/auth/signup'], { replaceUrl: true })
                return;
              }

              if (message?.includes("You reached max attempt")) {
                this.emailError = message;
                return;
              }
            }
          },
          error: (err) => {
            console.error('An error occurred. Please try again.', err);
          }
        });
      }
    });
  }

  verifyOtp() {
    console.log('on otp', this.userEmail, this.userOtp);
    this.signinService.verifyOtp({ username: this.userEmail, otp: this.userOtp }).subscribe({
      next: (response: ApiResponse<any>) => {
        const { status } = response;
        if (status === ApiStatus.SUCCESS) {
          console.log("OTP verified");
          this.router.navigate(['/'], { replaceUrl: true })
        } else if (status === ApiStatus.FAIL) {
          this.otpError = 'Invalid OTP';
        }
      }
    })
  }

  submitOtp() {
    if (!this.userOtp || this.userOtp.length !== 6) {
      this.otpError = 'Invalid OTP';
      return;
    }

    this.otpError = '';
    this.verifyOtp();
  }

  changeEmailAddress() {
    this.signinService.setSigninStep(SigninStep.EMAIL_VERIFICATION);
    this.userEmail = '';
    this.emailError = '';
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
    this.signinService.resetSigninStep();
    this.signinService.clearResendInterval();
  }
}
