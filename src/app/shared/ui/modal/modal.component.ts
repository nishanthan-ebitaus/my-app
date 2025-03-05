import { X, LucideAngularModule } from 'lucide-angular';
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
@Component({
  selector: 'ui-modal',
  standalone: true,
  imports: [CommonModule, LucideAngularModule],
  templateUrl: './modal.component.html',
  styleUrls: ['./modal.component.scss'],
})
export class ModalComponent {
  @Input() showClose = true;
  @Output() close = new EventEmitter<void>();
  closeIcon = X
  closeSvg = 'assets/icons/close.svg';

  onClose() {
    this.close.emit();
  }
}
