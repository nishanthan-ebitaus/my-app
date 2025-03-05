import { Injectable } from '@angular/core';
import { HttpService } from '@core/services/http.service';
import { API_URL } from '@src/app/core/constants/apiurls';
import { ApiResponse } from '@src/app/core/models/api-response.model';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TaxusLayoutService {

  constructor(private http: HttpService) { }

  // userInfo(): Observable<ApiResponse<any>> {
  //   return this.http.get<ApiResponse<any>>(API_URL.AUTH.USER_INFO);
  // }

  // statusInfo(): Observable<ApiResponse<any>> {
  //   return this.http.get<ApiResponse<any>>(API_URL.AUTH.USER_INFO);
  // }

}
