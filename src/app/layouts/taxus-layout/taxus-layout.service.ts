import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { HttpService } from '@core/services/http.service';
import { environment } from '@environments/environment';
import { API_URL } from '@src/app/core/constants/apiurls';
import { ApiResponse } from '@src/app/core/models/api-response.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaxusLayoutService {

  constructor(private http: HttpClient) { }

  userInfo(): any {
    return this.http.get<ApiResponse<any>>(API_URL.USER.USER_INFO);
  }

  entityMap(): any {
    return this.http.get<ApiResponse<any>>(API_URL.USER.ENTITY_MAP);
  }

  cacheSubEntity(data: any): any {
    return this.http.post<ApiResponse<any>>(API_URL.USER.CACHE_SUB_ENTITY, data);
  }

  sendApprovalRequest() {
    return this.http.post<ApiResponse<any>>(API_URL.USER.RESEND_APPROVAL_REQUEST, {});
  }

}
