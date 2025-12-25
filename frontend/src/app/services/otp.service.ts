import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

const API_URL = 'http://localhost:5000/api';

export interface SendOtpRequest {
  email: string;
  purpose: string; // "Register" | "Login"
}

export interface VerifyOtpRequest {
  email: string;
  code: string;
  purpose: string;
}

export interface OtpResponse {
  message: string;
  verified?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class OtpService {
  constructor(private http: HttpClient) {}

  sendOtp(email: string, purpose: 'Register' | 'Login'): Observable<any> {
    return this.http.post(`${API_URL}/Otp/send`, {
      email: email,
      purpose: purpose
    });
  }

  verifyOtp(email: string, code: string, purpose: 'Register' | 'Login'): Observable<OtpResponse> {
    return this.http.post<OtpResponse>(`${API_URL}/Otp/verify`, {
      email: email,
      code: code,
      purpose: purpose
    });
  }
}

