import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    // return true;
    if (this.authService.getAuthToken()) {
      return true;
    }

    this.router.navigate(['auth/siginin'], { replaceUrl: true });
    return false;
  }

}
