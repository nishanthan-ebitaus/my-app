import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '@src/app/auth/auth.service';
import { ApiResponse, ApiStatus } from '@src/app/core/models/api-response.model';
import { Observable } from 'rxjs';
import { debounceTime, distinctUntilChanged, first } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr'

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
  resendTimer$: Observable<number> = new Observable<number>();
  isGstDetailsFetched = false;
  isGstOtpVerified = false;
  isSignupSuccess = false;
  userOtpError = '';
  gstOtpError = '';
  showModal = false;
  showTermsModal = false;

  constructor(
    private authService: AuthService,
    private formBuilder: FormBuilder,
    private router: Router,
    private toastr: ToastrService,
  ) { }

  ngOnInit() {
    this.resendTimer$.subscribe((time) => {
      if (time === 0) {
        this.authService.clearResendInterval();
      }
    });

    this.emailForm = this.formBuilder.group({
      accountType: ['1', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      gstUsername: [''],
      gstIN: [''],
      gstOtp: [''],
      companyName: [''],
      isAgree: ['', Validators.required],
    });

    // Update validators dynamically when accountType changes
    this.emailForm.get('accountType')?.valueChanges.subscribe((selectedValue) => {
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

  gstDetails() {
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
      }
    });
  }


  requestGstOtp() {
    this.resendTimer$ = this.authService.startResendTimer();
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
    this.resendTimer$.pipe(first()).subscribe((time) => {
      if (time <= 0) {
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
    })
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

  onOtpEntered(otp: string) {
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
      gstUsername: 'GST Username is required',
      gstIN: 'GSTIN is required',
      gstOtp: 'OTP is required',
      companyName: 'Company Name is required',
      isAgree: 'You must accept the Terms & Conditions',
    };
    return messages[field] || 'This field is required';
  }

  signup() {
    const gstIN = this.emailForm.get('gstIN')?.value;
    const email = this.emailForm.get('email')?.value;
    const isAgree = this.emailForm.get('isAgree')?.value;
    const payload = { gstIN, email, isAgree };
    this.authService.signup(payload).subscribe({
      next: (response: ApiResponse<any>) => {
        const { status } = response;
        if (status === ApiStatus.SUCCESS) {
          // this.authService.setSignupStep(SignupStep.COMPANY_DETAILS);
          this.isSignupSuccess = true;
        }
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
