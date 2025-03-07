import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, QueryList, SimpleChanges, ViewChildren } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'ui-otp',
  templateUrl: './otp.component.html',
  styleUrls: ['./otp.component.scss'],
  imports: [ReactiveFormsModule, CommonModule]
})
export class UiOtpComponent implements OnInit, OnChanges {
  @Input() length: number = 6;
  @Input() onlyNumeric: boolean = true;
  @Input() isInvalid: boolean = false;
  @Input() required: boolean = false;
  @Input() disabled: boolean = false;
  @Input() label: string = '';
  @Input() errorMessage: string = '';
  @Input() inputProps: { [key: string]: any } = {};
  @Input() defaultValue: string = '';  // New input for default value
  @Output() otpEntered = new EventEmitter<string>();

  otpValues: FormControl[] = [];
  @ViewChildren('otpInput') otpInputs!: QueryList<ElementRef>;

  ngOnInit(): void {
    this.initializeOtpControls();
    if (this.defaultValue) {
      this.fillOtpInputs(this.defaultValue);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["inputProps"] || changes["disabled"]) {
      this.initializeOtpControls();
    }
    if (changes["defaultValue"] && this.defaultValue) {
      this.fillOtpInputs(this.defaultValue);
    }
  }

  private initializeOtpControls(): void {
    this.otpValues = Array(this.length)
      .fill(null)
      .map(() => new FormControl({ value: '', disabled: this.disabled }, { ...this.inputProps }));
  }

  private fillOtpInputs(value: string): void {
    value.split('').forEach((char, index) => {
      if (index < this.length) {
        this.otpValues[index].setValue(char);
      }
    });
    this.emitOtp();
  }

  clearErrors(): void {
    this.isInvalid = false;
    this.errorMessage = '';
  }

  onInputChange(index: number, event: any): void {
    const value = event.target.value;

    if (this.onlyNumeric && !/^\d$/.test(value)) {
      this.otpValues[index].setValue('');
      return;
    }

    if (value.length === 1) {
      this.otpValues[index].setValue(value);

      if (index < this.length - 1) {
        this.otpInputs.toArray()[index + 1].nativeElement.focus();
      }
    } else if (value === '') {
      this.otpValues[index].setValue('');
    }

    this.emitOtp();
  }

  handleBackspace(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace') {
      if (this.otpValues[index].value !== '') {
        this.otpValues[index].setValue('');
      } else if (index > 0) {
        this.otpValues[index - 1].setValue('');
        this.otpInputs.toArray()[index - 1].nativeElement.focus();
      }
      this.emitOtp();
      event.preventDefault();
    }
  }

  private emitOtp(): void {
    const otpValue = this.otpValues.map(control => control.value).join('');
    this.otpEntered.emit(otpValue);
    this.clearErrors();
  }
}
