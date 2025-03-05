import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../auth.service';

@Component({
  selector: 'auth-layout',
  standalone: true,
  templateUrl: './auth-layout.component.html',
  styleUrls: ['./auth-layout.component.scss'],
  imports: [CommonModule, RouterOutlet],
})
export class AuthLayoutComponent {
  currentRoute: string = '';

  constructor(private router: Router, private route: ActivatedRoute, private authService: AuthService) {
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => this.updateCurrentRoute());

    this.updateCurrentRoute();
    this.authService.logout()
  }

  private updateCurrentRoute(): void {
    let child = this.route;

    while (child.firstChild) {
      child = child.firstChild;
    }

    this.currentRoute = child.snapshot?.url.map(segment => segment.path).join('/') || '';
  }
}
