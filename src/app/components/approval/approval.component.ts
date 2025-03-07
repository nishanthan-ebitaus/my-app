import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ApiStatus } from '@src/app/core/models/api-response.model';
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
  gstIN: string = '';
  userEmail: string = '';
  approvalActionStatus: string | null = null;
  isDataError = false;

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
    console.log('on inside 1', this.token)
    if (this.token) {
      this.approvalService.approvalInfo(this.token).subscribe({
        next: (response) => {
          console.log('on inside')

          const { status, message, data } = response;
          if (status === ApiStatus.SUCCESS) {
            const { gstNumber, email } = data;

            this.gstIN = gstNumber;
            this.userEmail = email;
            if (message === 'Already Approved') {
              this.approvalActionStatus = 'approved';
            } else if (message === 'Already Rejected') {
              this.approvalActionStatus = 'denied';
            }
          } else if (status === ApiStatus.ERROR) {
              this.isDataError = true;
          }
        },
        error: (error) => {
          console.error('An error occurred:', error);
        }
      });
    }
  }

  updateApprovalInfo(action: string) {
    if (this.token) {
      this.approvalActionStatus = action === 'deny' ? 'denied' : 'approved';
      this.approvalService.updateApprovalInfo(this.token, action.toUpperCase()).subscribe();
    }
  }
}
