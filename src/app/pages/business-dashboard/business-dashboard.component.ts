import { NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';
import { BulkEntityComponent } from "@components/bulk-entity/bulk-entity.component";
import { NewEntityComponent } from "@components/new-entity/new-entity.component";
// import { TaxusDashboardService } from '../../features/dashboard/dashboard.service';

@Component({
  selector: 'business-dashboard',
  imports: [NgSwitch, NgSwitchCase, NgSwitchDefault, NewEntityComponent, BulkEntityComponent],
  templateUrl: './business-dashboard.component.html',
  styleUrls: ['./business-dashboard.component.scss']
})
export class BusinessDashboardComponent implements OnInit, OnDestroy {
  entityCreation: string = ''; // Default value
  private subscription?: Subscription;

  // constructor(private taxusDashboardService: TaxusDashboardService) { }

  ngOnInit() {
    // this.subscription = this.taxusDashboardService.entityCreation$.subscribe((option: string | null) => {
    //   this.entityCreation = option ?? '';
    // });
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }
}
