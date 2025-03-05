import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { API_URL } from '@src/app/core/constants/apiurls';
import { HttpService } from '@src/app/core/services/http.service';

@Injectable({
  providedIn: 'root',
})
export class ApprovalService {

  constructor(private http: HttpService) { }

  approvalInfo(token: string) {
    return this.http.get<any>(`${environment.API_BASE_URL}${API_URL.APPROVAL.VERFICAITON}?token=${encodeURIComponent(token)}`);
  }

  updateApprovalInfo(token: string, action: string) {
    return this.http.get<any>(`${environment.API_BASE_URL}${API_URL.APPROVAL.VERFICAITON}?token=${token}?action=${action}`);
  }
}
