import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanDeactivate, CanLoad, Router } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(): boolean {
    return true;
    // Check if the user is authenticated
  //   if (localStorage.getItem('authToken')) {
  //     return true;
  //   }

  //   this.router.navigate(['auth/siginin'], { replaceUrl: true });
  //   return false;
  }

}
