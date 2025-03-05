import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-access-status',
  standalone: false,
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.scss']
})
export class ApprovalComponent implements OnInit {
  gstin: string = '';
  customerName: string = '';

  constructor(private route: ActivatedRoute) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.gstin = params['gstin'] || 'N/A';
      this.customerName = params['customerName'] || 'Unknown';
    });
  }
}
