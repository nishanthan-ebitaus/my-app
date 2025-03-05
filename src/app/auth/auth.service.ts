import { HttpClient } from '@angular/common/http';
import { Injectable, NgZone } from '@angular/core';
import { API_URL } from '@core/constants/apiurls';
import { ApiResponse, ApiStatus } from '@core/models/api-response.model';
import { BehaviorSubject, debounceTime, fromEvent, merge, Observable, switchMap, tap } from 'rxjs';
import { GstDetailsMca, GstOtp, SigninRequest, SigninStep, Signup, SignupStep, VerifyGstOtp, VerifyOptRequest } from './auth.model';
import { Router } from '@angular/router';
import { environment } from '@environments/environment';
import { HttpService } from '../core/services/http.service';

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

  private resendInterval: any;
  private resendTimer: number = 30;

  constructor(private http: HttpService, private zone: NgZone, private router: Router) { }

  trackUserActivity() {
    const activityEvents$ = merge(
      fromEvent(document, 'mousemove'),
      fromEvent(document, 'click'),
      fromEvent(document, 'keydown')
    ).pipe(debounceTime(60000));

    this.zone.runOutsideAngular(() => {
      activityEvents$.subscribe(() => {
        const token = this.getAuthToken();
        console.log('checking the token')
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

  private setAuthToken(token: string): void {
    localStorage.setItem('authToken', token);
    this.authTokenSubject.next(token);
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('authToken');
  }

  private setRefreshToken(token: string): void {
    localStorage.setItem('refreshToken', token);
    this.authTokenSubject.next(token);
  }

  private removeToken() {
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

  startResendTimer(): Observable<number> {
    return new Observable<number>((observer) => {
      this.resendTimer = 30;
      this.resendInterval = setInterval(() => {
        this.resendTimer--;
        observer.next(this.resendTimer);
        if (this.resendTimer <= 0) {
          this.clearResendInterval();
          observer.complete();
        }
      }, 1000);
    });
  }

  clearResendInterval(): void {
    if (this.resendInterval) {
      clearInterval(this.resendInterval);
      this.resendInterval = null;
      this.resendTimer = 0;
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
    return this.http.post<any>(`${environment.API_BASE_URL}${API_URL.AUTH.SIGNIN}`, data);
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
}
