import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { ButtonComponent } from './ui/button/button.component';
import { ModalComponent } from './ui/modal/modal.component';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    ModalComponent,
    ButtonComponent,
    LucideAngularModule,
  ],
  exports: [
    ModalComponent,
    ButtonComponent,
    LucideAngularModule,
  ]
})
export class SharedModule { }
