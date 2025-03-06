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

  userInfo(): any {
    // return this.http.get<ApiResponse<any>>(API_URL.USER.USER_INFO);
    // fetch('http:192.168.29.102:8001/taxus/user/getRoleAndAccessInfo', {
    //   method: 'GET',  // or 'POST', 'PUT', etc., depending on your needs
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${localStorage.getItem('authToken')}`  // Include Authorization header with Bearer token
    //   }
    // })
    // .then((response) => {
    //   if (!response.ok) {
    //     throw new Error('Network response was not ok');
    //   }
    //   return response.json();  // Parse the JSON data from the response
    // })
    // .catch((error) => {
    //   console.error('Fetch error:', error);
    //   throw error;  // Handle the error accordingly
    // });
    fetch('/taxus/user/getRoleAndAccessInfo', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }
    })
    .then(response => response.json())
    .then(data => console.log('Response:', data))
    .catch(error => console.error('Error:', error));


//     const xhr = new XMLHttpRequest();
// xhr.open('GET', 'http://192.168.29.102:8001/taxus/user/getRoleAndAccessInfo', true);
// xhr.setRequestHeader('Authorization', `Bearer ${localStorage.getItem('authToken')}`);

// xhr.onreadystatechange = function () {
//   if (xhr.readyState === 4 && xhr.status === 200) {
//     console.log('Response:', xhr.responseText);
//   }
// };

// xhr.send();
  }

  // statusInfo(): Observable<ApiResponse<any>> {
  //   return this.http.get<ApiResponse<any>>(API_URL.AUTH.USER_INFO);
  // }

  entityMap(): any {
    // return this.http.get<ApiResponse<any>>(API_URL.AUTH.ENTITY_MAP);
    console.log('on emap')
    fetch('/auth/taxus/getEntityMap', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      }

    }).then(response => {
      console.log('on resposne', response)
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => console.log('Response:', data))
    .catch(error => console.error('Error:', error));
  }

  cacheSubEntity(data: any): any {
    // return this.http.get<ApiResponse<any>>(API_URL.AUTH.ENTITY_MAP);
    fetch(API_URL.USER.CACHE_SUB_ENTITY, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
      },
      body: JSON.stringify(data)  // Send data in the request body
    })
      .then(response => response.json())
      .then(data => console.log('Response:', data))
      .catch(error => console.error('Error:', error));
  }

}
