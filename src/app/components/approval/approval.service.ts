import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { API_URL } from '@src/app/core/constants/apiurls';
import { HttpService } from '@src/app/core/services/http.service';

@Injectable({
  providedIn: 'root',
})
export class ApprovalService {

  constructor(private http: HttpClient) { }

  approvalInfo(token: string) {
    return this.http.get<any>(`${API_URL.APPROVAL.VERFICAITON}?token=${encodeURIComponent(token)}`);
  }

  updateApprovalInfo(token: string, action: string) {
    return this.http.post<any>(`${API_URL.APPROVAL.ACTION}?token=${token}&action=${action}`, {});
  }
}
