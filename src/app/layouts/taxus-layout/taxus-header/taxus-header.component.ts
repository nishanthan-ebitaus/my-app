import { AuthService } from '@src/app/auth/auth.service';
import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { LucideAngularModule, LogOut } from 'lucide-angular';

@Component({
  selector: 'taxus-header',
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './taxus-header.component.html',
  styleUrls: ['./taxus-header.component.scss']
})
export class TaxusHeaderComponent {
  @Input() pageTitle = 'Header';
  @Input() activeLink: string | null = '/';
  logoutIcon = LogOut;

  constructor(private authService: AuthService) {}

  handleLogout() {
    this.authService.logout();
  }
}
