import { Component, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'business-header',
  templateUrl: './business-header.component.html',
  styleUrls: ['./business-header.component.scss']
})
export class BusinessHeaderComponent implements OnDestroy {
  private subscriptions: Subscription[] = [];

  // constructor(private taxusDashboardService: Dashbo) {}

  // refreshData() {
  //   this.taxusDashboardService.triggerResetToDefault();
  // }

  // entityCreation() {
  //   this.taxusDashboardService.triggerEntityCreation('new');
  // }

  // entitySelection(event: Event) {
  //   const value = (event.target as HTMLSelectElement).value;
  //   this.taxusDashboardService.triggerEntitySelection(value);
  // }

  ngOnDestroy() {
    // Unsubscribe from the observables to prevent memory leaks
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
