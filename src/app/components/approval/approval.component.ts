import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ApprovalService } from './approval.service';

@Component({
  selector: 'app-access-status',
  standalone: false,
  templateUrl: './approval.component.html',
  styleUrls: ['./approval.component.scss']
})
export class ApprovalComponent implements OnInit {
  token: string | null = null;
  currentUrl: string = '';

  constructor(
    private route: ActivatedRoute,
    private approvalService: ApprovalService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.token = params['token'] || null;
      console.log('Extracted Token:', this.token);
    });

    this.currentUrl = window.location.href;

    this.approvalInfo();
  }

  approvalInfo() {
    if (this.token) {
      this.approvalService.approvalInfo(this.token).subscribe();
    }
  }

  updateApprovalInfo(action: string) {
    if (this.token) {
      this.approvalService.updateApprovalInfo(this.token, action.toUpperCase()).subscribe();
    }
  }
}
