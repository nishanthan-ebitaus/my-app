import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, Output, Renderer2, signal, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

interface SelectOption {
  id: number;
  name: string;
  value: any;
}

@Component({
  selector: 'ui-select',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './select.component.html',
  styleUrls: ['./select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SelectComponent),
      multi: true,
    },
  ],
})
export class SelectComponent implements ControlValueAccessor {
  @Input() options: SelectOption[] = [];
  @Input() placeholder = 'Select...';
  @Input() label = '';
  @Input() required = false;
  @Input() customClass = '';
  @Input() errorMessage = '';

  isOpen = signal(false);
  selectedItem: SelectOption | null = null;
  highlightedIndex = -1;
  private clickListener!: () => void;

  constructor(private eRef: ElementRef, private renderer: Renderer2) {}

  private onChange: (value: any) => void = () => {};
  private onTouched: () => void = () => {};

  toggleDropdown(): void {
    this.isOpen.set(!this.isOpen());
    if (this.isOpen()) {
      this.highlightedIndex = -1;
      this.attachOutsideClickListener();
    } else {
      this.detachOutsideClickListener();
    }
  }

  selectItem(item: SelectOption): void {
    this.selectedItem = item;
    this.isOpen.set(false);
    this.onChange(item.value); // Update form control
    this.onTouched();
    this.detachOutsideClickListener();
  }

  writeValue(value: any): void {
    this.selectedItem = this.options.find((option) => option.value === value) || null;
  }

  registerOnChange(fn: (value: any) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    // Implement if needed (disable the dropdown)
  }

  trackById(index: number, option: SelectOption): number {
    return option.id;
  }

  private attachOutsideClickListener(): void {
    this.clickListener = this.renderer.listen('document', 'click', (event: Event) => {
      if (!this.eRef.nativeElement.contains(event.target)) {
        this.isOpen.set(false);
        this.detachOutsideClickListener();
      }
    });
  }

  private detachOutsideClickListener(): void {
    if (this.clickListener) {
      this.clickListener();
      this.clickListener = null!;
    }
  }

  handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      if (this.isOpen()) {
        if (this.highlightedIndex >= 0) {
          this.selectItem(this.options[this.highlightedIndex]);
        }
      } else {
        this.toggleDropdown();
      }
      event.preventDefault();
    } else if (event.key === 'Escape') {
      this.isOpen.set(false);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      this.navigateOptions(event.key);
    }
  }

  private navigateOptions(direction: 'ArrowDown' | 'ArrowUp') {
    if (!this.options.length) return;

    if (direction === 'ArrowDown') {
      this.highlightedIndex = (this.highlightedIndex + 1) % this.options.length;
    } else if (direction === 'ArrowUp') {
      this.highlightedIndex = this.highlightedIndex > 0 ? this.highlightedIndex - 1 : this.options.length - 1;
    }
  }
}
