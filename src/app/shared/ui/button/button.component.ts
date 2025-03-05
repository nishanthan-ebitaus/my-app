import { NgClass, NgStyle } from '@angular/common';
import { Component, Input } from '@angular/core';

export enum ButtonVariant {
  Primary = 'primary',
  Secondary = 'secondary',
  Danger = 'danger',
  Success = 'success'
}
@Component({
  selector: 'ui-button',
  imports: [NgClass, NgStyle],
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent {
  @Input() content: string = 'Click Me';
  @Input() type: string = 'button';
  @Input() variant: ButtonVariant = ButtonVariant.Primary;
  @Input() outlined: boolean = false;
  @Input() disabled: boolean = false;
  @Input() customStyle: { [key: string]: string } = {};

  variantClassMap = {
    [ButtonVariant.Primary]: 'btn-primary',
    [ButtonVariant.Secondary]: 'btn-secondary',
    [ButtonVariant.Danger]: 'btn-danger',
    [ButtonVariant.Success]: 'btn-success',
  };
}
