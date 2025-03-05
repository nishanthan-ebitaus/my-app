import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler } from '@angular/common/http';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  intercept(req: HttpRequest<any>, next: HttpHandler) {
    const authToken = 'YOUR_TOKEN_HERE';
    const cloned = req.clone({
      setHeaders: {
        Authorization: `Bearer eyJhbGciOiJIUzUxMiJ9.eyJpc1ZhbGlkIjp0cnVlLCJ1c2VySWQiOiI2N2M2MTlmYTk3Nzg5NzZjMTVhZDZjNWYiLCJpYXQiOjE3NDExNTA0NzcsImV4cCI6MTc0MTc1MDQ3N30.6q-SlEarGCuW9CLwAyznpDg-OXqK5hlHeiv0huzALBF_LdD9oZw1svBd5rRghtLUmyZ-uPFjqzXXlMqQbpiqcw`
      }
    });
    console.log('req cloned', cloned.headers)
    console.log('📢 Final Headers:', cloned.headers.keys());

    return next.handle(cloned);
  }
}
