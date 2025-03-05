import { NgClass, NgIf } from '@angular/common';
import { Component, forwardRef, Input } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

@Component({
  selector: 'ui-input',
  standalone: true,
  imports: [NgIf, NgClass],
  templateUrl: './input.component.html',
  styleUrls: ['./input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
})
export class InputComponent implements ControlValueAccessor {
  @Input() label: string = '';
  @Input() placeholder: string = 'Enter value';
  @Input() type: string = 'text';
  @Input() customClass: string = '';
  @Input() errorMessage: string = '';
  @Input() disabled: boolean = false;
  @Input() required: boolean = false;
  @Input() readOnly: boolean = false;
  @Input() isInvalid: boolean = false;
  @Input() note = '';
  @Input() validateOnBlur: boolean = false;
  @Input() inputProps: { [key: string]: any } = {}

  value: string | boolean = '';

  get processedLabel() {
    return this.label ? this.label.toLowerCase().replace(/ /g, '-') : '';
  }

  onChange: any = () => {};
  onTouched: any = () => {};

  writeValue(value: string | boolean): void {
    if (this.type === 'checkbox') {
      this.value = !!value; // Ensure boolean value
    } else {
      this.value = value || ''; // Handle null or undefined
    }
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  handleInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    let newValue = this.type === 'checkbox' ? target.checked : target.value;

    // Enforce maxLength if provided
    if (this.inputProps["maxLength"] && typeof newValue === 'string') {
      newValue = newValue.slice(0, this.inputProps["maxLength"]);
      target.value = newValue; // Reflect trimmed value in the input field
    }

    this.value = newValue;
    this.onChange(this.value);
    this.onTouched();
  }

}
