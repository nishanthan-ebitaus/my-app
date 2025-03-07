import { HttpEvent, HttpHandler, HttpInterceptor, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { environment } from 'src/environments/environment';  // Import environment
import { AuthService } from './app/auth/auth.service';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService, private router: Router) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const authToken = this.authService.getAuthToken();

    const clonedRequest = req.clone({
      url: `${environment.API_BASE_URL}${req.url}`,
      setHeaders: {
        'Content-Type': 'application/json; charset=utf-8',
        'Accept': 'application/json',
        ...(authToken ? { 'Authorization': `Bearer ${authToken}` } : {}),
      },
    });
    console.log('Through auth interceptor', clonedRequest.url);

    return next.handle(clonedRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        // If the error is due to invalid auth token, redirect to login
        if (error.status === 401 && error.error?.message === 'Invalid auth token') {
          // Clear any stored auth data if needed
          this.authService.removeToken();

          // Redirect to the login page
          this.router.navigate(['/auth/signin']);
        }
        // Otherwise, pass the error along
        return throwError(error);
      })
    );
  }
}
