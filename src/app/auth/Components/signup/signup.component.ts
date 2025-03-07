import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@src/app/auth/auth.service';
import { ApiResponse, ApiStatus } from '@src/app/core/models/api-response.model';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr'
import { SignupStep } from '../../auth.model';
import { Check } from 'lucide-angular';

@Component({
  selector: 'app-signup',
  standalone: false,
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
  emailForm!: FormGroup;
  options = [
    { id: 1, name: 'CA', value: '1' },
    { id: 2, name: 'Corporate', value: '2' },
  ];
  isSubmitted = false;
  gstUsernameError = '';
  gstINError = '';
  resendTimer!: number;
  isGstDetailsFetched = false;
  isGstOtpVerified = false;
  isSignupSuccess = 'email';
  userOtp = '';
  userOtpError = '';
  gstOtpError = '';
  showModal = false;
  showTermsModal = false;
  isLoading = false;
  otpError = '';
  irpForm!: FormGroup;
  irpFormSubmitted = false;
  emailError = '';
  tickIcon = Check;
  tempTimer = 30;
  tempTimerSub: any;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
    // this.authService.resendTimer$.subscribe((time) => {
    //   if (time === 0) {
    //     this.authService.clearResendInterval();
    //   }
    //   this.resendTimer = time;
    // });

    this.irpForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.emailForm = this.formBuilder.group({
      accountType: ['1', Validators.required],
      email: ['', [Validators.required, Validators.email, this.authService.restrictedEmailDomainsValidator()]],
      name: ['', [Validators.required]],
      gstUsername: [''],
      gstIN: [''],
      gstOtp: [''],
      companyName: [''],
      isAgree: [false, this.authService.isTrueValidator()],
    });

    // Update validators dynamically when accountType changes
    this.emailForm.get('accountType')?.valueChanges.subscribe((selectedValue) => {
      this.isSubmitted = false;
      this.updateConditionalValidators(selectedValue);
    });

    // update validation based on default accountType value
    this.updateConditionalValidators(this.emailForm.get('accountType')?.value);

    // // hit gstDetails when gstIN reaches 15 characters
    // this.emailForm.get('gstIN')?.valueChanges
    //   .pipe(debounceTime(300), distinctUntilChanged())
    //   .subscribe((gstIN) => {
    //     if (gstIN?.length === 15) {
    //       this.gstDetails();
    //     }
    //   });

    // verify gstOtp when user filled the gstOtp
    this.emailForm.get('gstOtp')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((gstOtp) => {
        if (gstOtp?.length === 6) {
          this.verifyGstOtp();
        }
      });
  }

  startTempTimer() {
    this.tempTimer = 30;
    if (this.tempTimerSub) {
      clearInterval(this.tempTimerSub);
    }
    console.log('timer trigered')
    this.tempTimerSub = setInterval(() => {
      console.log('Timer:', this.tempTimer);
      this.tempTimer--;

      if (this.tempTimer <= 0) {
        clearInterval(this.tempTimerSub);
        console.log('Timer finished');
      }
    }, 1000);
  }

  submitIrpForm(isProceeding = false) {
    // if (!isProceeding) {
      window.location.href = '/';
      return;
    // }

    // this.isLoading = true;
    // this.irpFormSubmitted = true;

    // if (this.irpForm.invalid) {
    //   this.isLoading = false;
    //   return;
    // }

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

  changeEmailAddress() {
    this.authService.setSignupStep(SignupStep.EMAIL_VERIFICATION);
    this.emailForm.get('email')?.setValue('');
  }

  submitOtp() {
    if (!this.userOtp || this.userOtp.length !== 6) {
      this.otpError = 'Invalid OTP';
      return;
    }

    this.otpError = '';
    this.verifyOtp();
  }

  verifyOtp() {
    this.isLoading = true;
    this.authService.verifyOtp({ username: this.emailForm.value.email, otp: this.userOtp }).subscribe({
      next: (response: ApiResponse<any>) => {
        const { status } = response;
        if (status === ApiStatus.SUCCESS) {
          console.log("OTP verified");
          this.isSignupSuccess = 'irp';
        } else if (status === ApiStatus.FAIL) {
          this.otpError = 'Invalid OTP';
        }
      },
      complete: () => {
        this.isLoading = false;
      },
    })
  }

  resendLoginOtp() {
    console.log('reached resendloginotp')
    // this.resendTimer$.subscribe((timerValue) => {
      console.log(this.tempTimer)
      if (this.tempTimer === 0) {
        this.authService.signin({ username: this.emailForm.value.email }).subscribe({
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
                this.otpError = message;
                return;
              }
            }
          },
          error: (err) => {
            console.error('An error occurred. Please try again.', err);
          }
        });
      }
    // });
  }

  gstDetails() {
    this.isLoading = true;
    const emailId = this.emailForm.get('email')?.value;
    const gstIN = this.emailForm.get('gstIN')?.value;
    const gstUsername = this.emailForm.get('gstUsername')?.value;

    if (!gstUsername) {
      this.gstUsernameError = 'GST Username is required';
    }

    if (!gstIN) {
      this.gstINError = 'GSTIN is required';
      return;
    }

    const payload = { emailId, gstIN, gstUsername };
    this.authService.gstDetails(payload).subscribe({
      next: (response: ApiResponse<any>) => {
        const { status, message, data } = response;
        if (status === ApiStatus.SUCCESS) {
          this.gstINError = '';
          const { companyName } = data;
          this.emailForm.get('companyName')?.setValue(companyName);
          this.requestGstOtp();
          this.isGstDetailsFetched = true;
        } else {
          if (message === 'This GstIN is already registered') {
            // this.showModal = true;
            this.gstINError = 'This GSTIN is already registered';
            this.toastr.info('everything is broken', 'Major Error', {
              timeOut: 3000,
            })
            return;
          }
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  requestGstOtp() {
    // this.authService.resendTimer$.subscribe((timer) => {
    //   this.resendTimer = timer;
    // });
    this.startTempTimer();
    this.authService.requestGstOtp({ gstUsername: this.emailForm.get('gstUsername')?.value })
      .subscribe({
        next: (reponse: ApiResponse<any>) => {
          const { status } = reponse;
          if (status === ApiStatus.SUCCESS) {
            // this.verifyGstOtp();
          } else {
            console.log('toast');
          }
        }
      })
  }

  handleResendGstOtp() {
    // this.resendTimer$.pipe(first()).subscribe((time) => {
      if (this.resendTimer <= 0) {
        this.authService.requestGstOtp({ gstUsername: this.emailForm.get('gstUsername')?.value })
          .subscribe({
            next: (reponse: ApiResponse<any>) => {
              const { status } = reponse;
              if (status === ApiStatus.SUCCESS) {
                // this.verifyGstOtp();
              } else {
                console.log('toast');
              }
            }
          })
      }
    // })
  }

  verifyGstOtp() {
    const otp = this.emailForm.get('gstOtp')?.value;
    const gstIN = this.emailForm.get('gstIN')?.value;

    this.authService.verifyGstOtp({ otp, gstIN })
      .subscribe({
        next: (response: ApiResponse<any>) => {
          const { status } = response;
          if (status === ApiStatus.SUCCESS) {
            this.isGstOtpVerified = true;
          } else {
            this.gstOtpError = 'Invalid OTP';
          }
        }
      });
  }

  onGstOtpEntered(otp: string) {
    console.log(otp);
    this.emailForm.get('gstOtp')?.setValue(otp);
  }

  updateConditionalValidators(accountType: string) {
    const requiredFields = ['gstUsername', 'gstIN', 'gstOtp', 'companyName'];

    requiredFields.forEach((field) => {
      const control = this.emailForm.get(field);
      if (accountType === '2') {
        if (field === "gstOtp" && !this.isGstDetailsFetched) return;

        control?.setValidators([Validators.required]);

        if (field === 'gstIN') {
          console.log('gst field')
          control?.setValidators([Validators.required, this.authService.gstValidator()]);
        }
      } else {
        control?.clearValidators();
        control?.setValue('');
      }
      control?.updateValueAndValidity();
    });
  }

  getErrorMessage(field: string): string {
    const control = this.emailForm.get(field);

    if ((this.isSubmitted || control?.touched || control?.dirty) && control?.errors) {
      if (control.hasError('required')) {
        return this.getRequiredMessage(field);
      }
      if (control.hasError('email')) {
        return 'Invalid email';
      }
      if (control.hasError('restrictedDomain')) {
        return 'Enter your corporate email';
      }
      if (control.hasError('invalidGST')) {
        return 'Invalid GSTIN';
      }
      if (control.hasError('pattern')) {
        return 'OTP must be a 6-digit number';
      }
    }
    return '';
  }

  getRequiredMessage(field: string): string {
    const messages: { [key: string]: string } = {
      accountType: 'Account Type is required',
      email: 'Email is required',
      name: 'Username is required',
      gstUsername: 'GST Username is required',
      gstIN: 'GSTIN is required',
      gstOtp: 'OTP is required',
      companyName: 'Company Name is required',
      isAgree: 'You must accept the Terms & Conditions',
    };
    return messages[field] || 'This field is required';
  }

  signup() {
    this.isLoading = true;
    const gstIN = this.emailForm.get('gstIN')?.value;
    const email = this.emailForm.get('email')?.value?.toLowerCase();
    const name = this.emailForm.get('name')?.value;
    const isAgree = this.emailForm.get('isAgree')?.value;
    const payload = { gstIN, email, name, isAgree };
    this.authService.signup(payload).subscribe({
      next: (response: ApiResponse<any>) => {
        const { status, message } = response;
        if (status === ApiStatus.SUCCESS) {
          // this.authService.setSignupStep(SignupStep.COMPANY_DETAILS);
          this.isSignupSuccess = 'otp';
          this.startTempTimer();
        } else {
          if (message === 'User already exists') {
            this.emailError = message;
          }
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  updateTermsModal() {
    this.showTermsModal = !this.showTermsModal;
  }

  handleSignupUserOtp(otp: string) {
    console.log(this.emailForm.get('email')?.value, '******************')
    this.authService.verifyOtp({ username: this.emailForm.get('email')?.value, otp }).subscribe({
      next: (response: ApiResponse<any>) => {
        const { status } = response;
        if (status === ApiStatus.SUCCESS) {
          this.router.navigate([''], { replaceUrl: true });
        } else {
          this.userOtpError = 'Invalid OTP';
          console.log('on pa', this.userOtpError)
        }
      }
    })
  }

  onSubmit() {
    this.isSubmitted = true;
    if (this.emailForm.valid) {
      if (this.emailForm.value.accountType === '2' && !this.isGstOtpVerified) return;
      console.log('Form Submitted:', this.emailForm.value);
      this.signup();
    } else {
      console.log('Form is invalid', this.emailForm.errors);
    }
  }
}
