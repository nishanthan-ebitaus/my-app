import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

@Component({
  selector: 'taxus-header',
  imports: [CommonModule],
  templateUrl: './taxus-header.component.html',
  styleUrls: ['./taxus-header.component.scss']
})
export class TaxusHeaderComponent {
  @Input() pageTitle = 'Header';
  @Input() activeLink: string | null = '/';
}
