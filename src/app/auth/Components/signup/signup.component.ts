import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@src/app/auth/auth.service';
import { ApiResponse, ApiStatus } from '@src/app/core/models/api-response.model';
import { Check } from 'lucide-angular';
import { ToastrService } from 'ngx-toastr';
import { debounceTime, distinctUntilChanged, finalize } from 'rxjs/operators';
import { SignupStep } from '../../auth.model';
import { TaxusLayoutService } from '@src/app/layouts/taxus-layout/taxus-layout.service';

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
  isValidateEmailSent = false;
  isEmailValidated = false;
  userEmailOtpError = '';
  isSignupSuccess = 'req-docs';
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
    private taxusService: TaxusLayoutService,
  ) { }

  ngOnInit() {
    this.irpForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required],
    });

    this.emailForm = this.formBuilder.group({
      accountType: ['2', Validators.required],
      email: ['', [Validators.required, Validators.email, this.authService.restrictedEmailDomainsValidator()]],
      userEmailOtp: [''],
      name: ['', [Validators.required]],
      gstUsername: [''],
      gstIN: [''],
      gstOtp: [''],
      companyName: [''],
      isAgree: [false, this.authService.isTrueValidator],
    });

    // Update validators dynamically when accountType changes
    this.emailForm.get('accountType')?.valueChanges.subscribe((selectedValue) => {
      this.isSubmitted = false;
      this.updateConditionalValidators(selectedValue);
    });

    // update validation based on default accountType value
    this.updateConditionalValidators(this.emailForm.get('accountType')?.value);

    // verify gstOtp when user filled the gstOtp
    this.emailForm.get('gstOtp')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((gstOtp) => {
        if (gstOtp?.length === 6) {
          this.verifyGstOtp();
        }
      });

    // verify userEmailOtp when user filled the userEmailOtp
    this.emailForm.get('userEmailOtp')?.valueChanges
      .pipe(debounceTime(300), distinctUntilChanged())
      .subscribe((userEmailOtp) => {
        if (userEmailOtp?.length === 6) {
          this.verifyUserEmailOtp();
        }
      });

    this.emailForm.get('email')?.valueChanges.subscribe(() => {
      this.emailError = '';
    });

    this.emailForm.get('gstIN')?.valueChanges.subscribe(() => {
      this.gstINError = '';
    });

    this.emailForm.get('gstUsername')?.valueChanges.subscribe(() => {
      this.gstUsernameError = '';
    });

    this.emailForm.get('gstOtp')?.valueChanges.subscribe(() => {
      this.gstOtpError = '';
    });

    this.emailForm.get('name')?.valueChanges.subscribe(value => {
      const titleCasedValue = value
        .split(' ')
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');

      this.emailForm.get('name')?.setValue(titleCasedValue, { emitEvent: false });
    });

  }

  updateSignupStep(step: string) {
    this.isSignupSuccess = step;
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
    if (!isProceeding) {
      window.location.href = '/';
      return;
    }

    this.isLoading = true;
    this.irpFormSubmitted = true;

    if (this.irpForm.invalid) {
      this.isLoading = false;
      return;
    }

    this.authService.saveIRPCredentials(this.irpForm.value).pipe(
      finalize(() => {
        this.isLoading = false;
      })
    ).subscribe({
      next: (response: ApiResponse<any>) => {
        const { status } = response;
        if (status === ApiStatus.SUCCESS) {
          window.location.href = '/';
          return;
        }
      },
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
    // this.resendTimer$.subscribe((timerValue) => {
    if (this.tempTimer === 0) {
      this.startTempTimer();
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

  validateUserEmail() {
    const email = this.emailForm.get('email')?.value?.toLowerCase();

    this.authService.validateUserEmail({ email }).subscribe({
      next: (response: ApiResponse<any>) => {
        const { status, message } = response;
        if (status === ApiStatus.SUCCESS) {
          this.emailError = '';
          this.isValidateEmailSent = true;
          this.startTempTimer();
          this.toastr.info('OTP has been sent to your E-Mail!')
        } else {
            this.emailError = message || 'Invalid email';
            return;
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    })
  }

  verifyUserEmailOtp() {
    const otp = this.emailForm.get('userEmailOtp')?.value;
    const email = this.emailForm.get('email')?.value;

    this.authService.verifyUserEmailOtp({ email, otp })
      .subscribe({
        next: (response: ApiResponse<any>) => {
          const { status } = response;
          if (status === ApiStatus.SUCCESS) {
            this.isEmailValidated = true;
            this.toastr.success('E-Mail has been verified successfully!')
            clearInterval(this.tempTimerSub)
          } else {
            this.userEmailOtpError = 'Invalid OTP';
          }
        }
      });
  }

  gstDetails() {
    this.isLoading = true;
    const emailId = this.emailForm.get('email')?.value;
    const gstIN = this.emailForm.get('gstIN')?.value;
    const gstUsername = this.emailForm.get('gstUsername')?.value;

    if (!this.isEmailValidated) {
      this.emailError = 'Email is not validated';
      return;
    }

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
    this.startTempTimer();
    this.authService.requestGstOtp({ gstUsername: this.emailForm.get('gstUsername')?.value })
      .subscribe({
        next: (reponse: ApiResponse<any>) => {
          const { status } = reponse;
          if (status === ApiStatus.SUCCESS) {
            // this.verifyGstOtp();
            this.toastr.info('OTP has been sent to the authorized signatory!')
          } else {
            console.log('toast');
          }
        }
      })
  }

  handleResendGstOtp() {
    // this.resendTimer$.pipe(first()).subscribe((time) => {
    if (this.tempTimer <= 0) {
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
    // })
  }

  handleResendUserEmailOtp() {
    if (this.tempTimer <= 0) {
      clearInterval(this.tempTimerSub)
      this.validateUserEmail();
    }
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
            clearInterval(this.tempTimerSub)
            this.toastr.success('GSTIN has been verified successfully!')
          } else {
            this.gstOtpError = 'Invalid OTP';
          }
        }
      });
  }

  onUserEmailOtpEntered(otp: string) {
    this.emailForm.get('userEmailOtp')?.setValue(otp);
  }

  onGstOtpEntered(otp: string) {
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
          control?.setValidators([Validators.required, this.authService.gstValidator()]);
        }

        if (field === 'gstUsername') {
          control?.setValidators([Validators.required, this.authService.gstUsernameValidator()]);
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

    if (field === 'isAgree' && this.isSubmitted && control?.value === false) {
      return "Please accept terms and conditions";
    }

    if ((this.isSubmitted || control?.touched || control?.dirty) && control?.errors) {
      if (control.hasError('mustBeTrue')) {
        return 'Please accept terms and conditions';
      }

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
      if (control.hasError('invalidGSTUsername')) {
        return 'Invalid GST Username';
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

    const payload = { gstIN, email, username: name, isAgree };
    this.authService.signup(payload).subscribe({
      next: (response: ApiResponse<any>) => {
        const { status, message, data } = response;
        if (status === ApiStatus.SUCCESS) {
          const { authToken, refreshToken, entityId } = data;
          this.authService.setAuthToken(authToken);
          this.authService.setRefreshToken(refreshToken);

          // this.isSignupSuccess = 'otp';
          // this.startTempTimer();
          if (this.emailForm.value.accountType === '2') {
            this.cacheSubEntity(entityId);
          } else {
            window.location.href = '/';
          }
          this.toastr.success('Your account has been created!')
        } else {
          if (typeof message === 'string') {
            this.emailError = message;
          }
        }
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  sendApprovalRequest() {
    this.taxusService.sendApprovalRequest().subscribe({
      next: (response: ApiResponse<any>) => {
        const { status } = response;
        if(status === ApiStatus.SUCCESS) {
          console.log('Approval Request Sent');
        } else {
          console.log('An error occurred whilw sending approval request');
        }
      }
    })
  }

  cacheSubEntity(entityId: string) {
    this.taxusService.cacheSubEntity({ entityId }).subscribe({
      next: (response: ApiResponse<any>) => {
        const { status } = response;
        if (status === ApiStatus.SUCCESS) {
          this.sendApprovalRequest();
          this.isSignupSuccess = 'irp';
        }
      }
    })
  }

  updateTermsModal() {
    this.showTermsModal = !this.showTermsModal;
  }

  handleSignupUserOtp(otp: string) {
    this.authService.verifyOtp({ username: this.emailForm.get('email')?.value, otp }).subscribe({
      next: (response: ApiResponse<any>) => {
        const { status } = response;
        if (status === ApiStatus.SUCCESS) {
          this.router.navigate([''], { replaceUrl: true });
        } else {
          this.userOtpError = 'Invalid OTP';
        }
      }
    })
  }

  onSubmit() {
    this.isSubmitted = true;

    console.log('on submttting', this.getErrorMessage('isAgree'))

    if (this.emailForm.valid && !this.getErrorMessage('isAgree')) {
      if (this.emailForm.value.accountType === '2' && !this.isGstOtpVerified) return;
      console.log('Form Submitted:', this.emailForm.value);
      this.signup();
    } else {
      console.log('Form is invalid', this.emailForm.errors);
    }
  }
}
