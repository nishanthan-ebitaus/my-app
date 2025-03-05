import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { Observable, from } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  private axiosInstance: AxiosInstance;
  API_BASE_URL = environment.API_BASE_URL;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: this.API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: true,
    });

    this.initializeInterceptors();
  }

  private initializeInterceptors() {
    this.axiosInstance.interceptors.request.use(
      (config) => {
        const modifiedConfig = config as InternalAxiosRequestConfig;
        const token = localStorage.getItem('authToken');
        if (token) {
          modifiedConfig.headers = modifiedConfig.headers || {};
          modifiedConfig.headers.Authorization = `Bearer ${token}`;
        }
        return modifiedConfig;
      },
      (error) => Promise.reject(error)
    );
  }


  private mapResponse<T>(response: AxiosResponse<T>): T {
    return response.data as T;
  }

  // Request Method
  request<T = any>(config: AxiosRequestConfig): Observable<T> {
    return from(this.axiosInstance.request<T>(config)).pipe(
      map((response: AxiosResponse<T>) => this.mapResponse<T>(response)),
      catchError((error) => {
        return [error.response || error];
      })
    );
  }

  // Get Method
  get<T = any>(url: string, config?: AxiosRequestConfig): Observable<T> {
    return from(this.axiosInstance.get<T>(url, config)).pipe(
      map((response: AxiosResponse<T>) => this.mapResponse<T>(response)),
      catchError((error) => {
        return [error.response || error];
      })
    );
  }

  // Post Method
  post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Observable<T> {
    return from(this.axiosInstance.post<T>(url, data, config)).pipe(
      map((response: AxiosResponse<T>) => this.mapResponse<T>(response)),
      catchError((error) => {
        return [error.response || error];
      })
    );
  }

  // Put Method
  put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Observable<T> {
    return from(this.axiosInstance.put<T>(url, data, config)).pipe(
      map((response: AxiosResponse<T>) => this.mapResponse<T>(response)),
      catchError((error) => {
        return [error.response || error];
      })
    );
  }

  // Delete Method
  delete<T = any>(url: string, config?: AxiosRequestConfig): Observable<T> {
    return from(this.axiosInstance.delete<T>(url, config)).pipe(
      map((response: AxiosResponse<T>) => this.mapResponse<T>(response)),
      catchError((error) => {
        return [error.response || error];
      })
    );
  }
}
