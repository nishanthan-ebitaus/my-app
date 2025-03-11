import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';
import { Router } from '@angular/router';
import { API_URL } from '@core/constants/apiurls';
import { ApiResponse, ApiStatus } from '@core/models/api-response.model';
import { BehaviorSubject, debounceTime, fromEvent, interval, merge, Observable, retry, switchMap, takeWhile, tap } from 'rxjs';
import { GstDetailsMca, GstOtp, IrpCredentials, SigninRequest, SigninStep, Signup, SignupStep, VerifyGstOtp, VerifyOptRequest } from './auth.model';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private signupStepSubject = new BehaviorSubject<SignupStep>(SignupStep.EMAIL_VERIFICATION);
  signupStep$ = this.signupStepSubject.asObservable();
  private authTokenSubject = new BehaviorSubject<string | null>(localStorage.getItem("authToken"));
  authToken$ = this.authTokenSubject.asObservable();
  private signinStepSubject = new BehaviorSubject<SigninStep>(SigninStep.EMAIL_VERIFICATION);
  signinStep$ = this.signinStepSubject.asObservable();

  private resendTimerSubject = new BehaviorSubject<number>(30);
  resendTimer$ = this.resendTimerSubject.asObservable(); // Expose as Observable for UI components
  private resendInterval: any;

  constructor(private http: HttpClient, private zone: NgZone, private router: Router) { }

  trackUserActivity() {
    const activityEvents$ = merge(
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'click'),
      fromEvent(document, 'keydown')
    ).pipe(debounceTime(60000));

    this.zone.runOutsideAngular(() => {
      activityEvents$.subscribe(() => {
        const token = this.getAuthToken();
        if (token && this.isTokenExpiringSoon(token)) {
          this.zone.run(() => this.refreshToken().subscribe());
        }
      });
    });
  }

  private isTokenExpiringSoon(token: string, bufferTime: number = 180): boolean {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expTime = payload.exp * 1000;
    return expTime - Date.now() < bufferTime * 1000;
  }

  refreshToken() {
    return this.http.post<ApiResponse<any>>('/api/refresh-token', {}).pipe(
      switchMap((res: ApiResponse<any>) => {
        const { status, data } = res;
        if (status === ApiStatus.SUCCESS) {
          const { authToken } = data;
          this.setAuthToken(authToken);
        }
        return [];
      })
    );
  }

  getAuthToken(): string | null {
    return localStorage.getItem('authToken');
  }

  setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
    this.authTokenSubject.next(token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('authToken');
  }

  setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
    this.authTokenSubject.next(token);
  }

  removeToken() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('refreshToken');
  }

  logout(): void {
    this.removeToken();
    this.authTokenSubject.next(null);
    this.router.navigate(['/auth/signin'], { replaceUrl: true });
  }

  setSignupStep(step: SignupStep): void {
    this.signupStepSubject.next(step);
    if (step === SignupStep.EMAIL_VERIFICATION) {
      this.clearResendInterval();
    }
  }

  resetSignupStep(): void {
    this.signupStepSubject.next(SignupStep.EMAIL_VERIFICATION);
    this.clearResendInterval();
  }

  setSigninStep(step: SigninStep): void {
    this.signinStepSubject.next(step);
    if (step === SigninStep.EMAIL_VERIFICATION) {
      this.clearResendInterval(); // Reset the timer when changing to email verification
    }
  }

  resetSigninStep(): void {
    this.signinStepSubject.next(SigninStep.EMAIL_VERIFICATION);
    this.clearResendInterval();
  }

  gstValidator(): ValidatorFn {
    const gstPattern = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[0-9]{1}Z[A-Z0-9]{1}$/;
    // 33ABCDE1234A1Z9

    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const isValid = gstPattern.test(control.value);
      console.log('GST Number:', control.value, isValid);
      return isValid ? null : { invalidGST: true };
    };
  }

  gstUsernameValidator(): ValidatorFn {
    const usernamePattern = /^[a-zA-Z0-9_ ]+$/;

    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const isValid = usernamePattern.test(control.value);
      console.log('Username:', control.value, isValid);
      return isValid ? null : { invalidGSTUsername: true };
    };
  }

  isTrueValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      console.log('isTrueValidator triggered', control.value);  // Log the value
      return control.value === true ? null : { mustBeTrue: true };
    };
  }

  restrictedEmailDomainsValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) {
        return null;
      }

      const restrictedDomains = ['gmail', 'yahoo'];
      const emailParts = control.value.split('@');

      if (emailParts.length < 2) {
        return { email: true }
      }

      const emailDomain = emailParts[1]?.toLowerCase()?.split('.')[0]; // only domain
      const emailTLD = emailParts[1]?.toLowerCase()?.split('.')[1]; // only top level domain (.com / .in)

      if (!emailTLD || emailTLD.length < 2) {
        return { email: true };
      }

      if (emailParts.length === 2 && restrictedDomains.includes(emailDomain)) {
        return { restrictedDomain: true };
      }

      return null;
    };
  }

  isRestrictedEmailDomain(email: string) {
    const restrictedDomains = ['gmail.com', 'yahoo.com'];
    const emailParts = email.split('@');

    if (emailParts.length === 2 && restrictedDomains.includes(emailParts[1].toLowerCase())) {
      return true;
    }

    return false;
  }

  startResendTimer(): void {
    this.resendTimerSubject.next(5); // Reset timer to 30
    this.resendInterval = interval(1000)
      .pipe(takeWhile(() => this.resendTimerSubject.value > 0))
      .subscribe(() => {
        const newValue = this.resendTimerSubject.value - 1;
        this.resendTimerSubject.next(newValue);
        if (newValue <= 0) {
          this.clearResendInterval();
        }
      });
  }

  clearResendInterval(): void {
    if (this.resendInterval) {
      this.resendInterval.unsubscribe();
    }
  }

  validateEmail(email: string): boolean {
    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailPattern.test(email);
  }

  signup(data: Signup): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(API_URL.AUTH.SIGNUP, data);
  }

  gstDetails(data: GstDetailsMca): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(API_URL.GST.GST_DETAILS_MCA, data);
  }

  requestGstOtp(data: GstOtp): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(API_URL.GST.REQUEST_GST_OTP, data);
  }

  verifyGstOtp(data: VerifyGstOtp): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(API_URL.GST.VERIFY_GST_OTP, data);
  }

  signin(data: SigninRequest): Observable<ApiResponse<any>> {
    this.trackUserActivity();
    return this.http.post<any>(API_URL.AUTH.SIGNIN, data);
  }

  verifyOtp(data: VerifyOptRequest): Observable<ApiResponse<any>> {
    return this.http.post<ApiResponse<any>>(API_URL.AUTH.VERIFY_OTP, data).pipe(
      tap((response: ApiResponse<any>) => {
        const { status, data } = response;
        if (status === ApiStatus.SUCCESS) {
          const { authToken, refreshToken } = data;
          this.setAuthToken(authToken);
          this.setRefreshToken(refreshToken);
        }
      })
    );
  }

  saveIRPCredentials(data: IrpCredentials) {
    return this.http.post<ApiResponse<any>>(API_URL.USER.IRP_CREDENTIALS, data);
  }

  validateUserEmail(data: { email: string }) {
    return this.http.post<ApiResponse<any>>(API_URL.AUTH.VALIDATE_EMAIL, data);
  }

  verifyUserEmailOtp(data: { email: string, otp: string }) {
    return this.http.post<ApiResponse<any>>(API_URL.AUTH.VALIDATE_EMAIL_OTP, data);
  }

}
