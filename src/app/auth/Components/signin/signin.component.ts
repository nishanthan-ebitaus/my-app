import { Component, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ApiResponse, ApiStatus } from '@src/app/core/models/api-response.model';
import { finalize, Observable, Subject, takeUntil } from 'rxjs';
import { SigninStep } from '../../auth.model';
import { AuthService } from '../../auth.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-signin',
  standalone: false,
  templateUrl: './signin.component.html',
  styleUrl: './signin.component.scss'
})
export class SigninComponent implements OnInit, OnDestroy {
  emailForm!: FormGroup;
  userEmail = '';
  emailError = '';
  userOtp!: string;
  otpError = '';
  resendTimer!: number;
  signInFormStep!: SigninStep;
  isLoading = false;
  tempTimer = 30;
  isSubmitted = false;

  private destroy$ = new Subject<void>();

  constructor(private signinService: AuthService, private router: Router, private fb: FormBuilder) { }

  ngOnInit() {
    this.signinService.startResendTimer();

    console.log('on signin comp')

    this.emailForm = this.fb.group({
      email: ['', [Validators.required, Validators.email, this.signinService.restrictedEmailDomainsValidator()]],
    })

    this.signinService.resendTimer$.subscribe((timer) => {
      this.resendTimer = timer;
      console.log('this.resendTimer', this.resendTimer)
    });

    this.signinService.signinStep$
      .pipe(takeUntil(this.destroy$))
      .subscribe(step => {
        this.signInFormStep = step;
        if (step === SigninStep.EMAIL_VERIFICATION) {
          this.signinService.clearResendInterval();
        }
      });
  }

  getErrorMessage(field: string): string {
    const control = this.emailForm.get(field);

    if ((this.isSubmitted || control?.touched || control?.dirty) && control?.errors) {
      if (control.hasError('required')) {
        return 'Email is required';
      }
      if (control.hasError('email')) {
        return 'Invalid email';
      }
      if (control.hasError('restrictedDomain')) {
        return 'Enter your corporate email';
      }
    }
    return '';
  }

  startTempTimer() {
    this.tempTimer = 30;
    const intervalId = setInterval(() => {
      console.log('Timer:', this.tempTimer);
      this.tempTimer--;

      if (this.tempTimer <= 0) {
        clearInterval(intervalId);
        console.log('Timer finished');
      }
    }, 1000);
  }

  isRestricedDomain() {
    return !this.signinService.validateEmail(this.userEmail) &&  this.signinService.isRestrictedEmailDomain(this.userEmail);
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
    // if (this.userEmail === '') {
    //   this.emailError = 'Email is required';
    //   return;
    // }

    // if (!this.signinService.validateEmail(this.userEmail)) {
    //   this.emailError = 'Invalid email';
    //   return;
    // }

    this.emailError = '';
    this.isSubmitted = true;
    this.handleSignin();
  }

  handleSignin() {
    this.isLoading = true;
    this.signinService.signin({ username: this.emailForm.value.email }).pipe(
      finalize(() => {
        console.log('on finalize');
        this.isLoading = false;
      })
    ).subscribe({
      next: (response: ApiResponse<any>) => {
        const { status, message } = response;
        if (status === ApiStatus.SUCCESS) {
          console.log("success");
          this.signinService.setSigninStep(SigninStep.OTP_VERIFICATION);
          this.startTempTimer();
        } else if (status === ApiStatus.FAIL) {
          if (message === 'User is not present') {
            this.emailError = message;
          } else if (message?.includes("You reached max attempt")) {
            this.emailError = message;
          }
        }
      },
      error: (err) => {
        console.error('An error occurred. Please try again.', err);
      },
      complete: () => {
        this.isLoading = false;
        console.log('on complete')
      }
    });
  }


  resendLoginOtp() {
    // this.resendTimer$.subscribe((timerValue) => {
      console.log(this.tempTimer)
      if (this.tempTimer === 0) {
        this.startTempTimer();
        this.signinService.signin({ username: this.userEmail }).subscribe({
          next: (response: ApiResponse<any>) => {
            const { status, message } = response;
            if (status === ApiStatus.SUCCESS) {
              console.log("succeess");
              // this.signinService.setSigninStep(SigninStep.OTP_VERIFICATION);
            } else if (response.status === ApiStatus.FAIL) {
              if (message === 'User is not present') {
                this.emailError = message;
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
      } else {
        console.log('re se rej')
      }
    // });
  }

  verifyOtp() {
    // this.router.navigateByUrl('/', { replaceUrl: true })
    // localStorage.setItem('authToken', 'test');
    // window.location.href = '/';
    this.isLoading = true;
    this.signinService.verifyOtp({ username: this.emailForm.value.email, otp: this.userOtp }).subscribe({
      next: (response: ApiResponse<any>) => {
        const { status } = response;
        if (status === ApiStatus.SUCCESS) {
          console.log("OTP verified");
          this.router.navigate([''], { replaceUrl: true })
        } else if (status === ApiStatus.FAIL) {
          this.otpError = 'Invalid OTP';
        }
      },
      complete: () => {
        this.isLoading = false;
      },
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
