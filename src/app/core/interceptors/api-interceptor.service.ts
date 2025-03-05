import { HttpInterceptor, HttpEvent, HttpHandler, HttpRequest } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { Observable } from 'rxjs';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  API_BASE_URL = environment.API_BASE_URL;

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = localStorage.getItem('authToken');

    console.log('reached interceptor');

    let clonedRequest = req.clone({
      url: req.url.startsWith('http') ? req.url : `${this.API_BASE_URL}${req.url}`,
    });

    if (token) {
      clonedRequest = clonedRequest.clone({
        setHeaders: { Authorization: `Bearer ${token}` },
      });
    }

    return next.handle(clonedRequest);
  }
}
