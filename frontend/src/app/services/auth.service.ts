import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

const API_URL = 'http://localhost:5000/api';

export interface User {
  id: number;
  username: string;
  email: string;
  hoTen: string;
  soDienThoai: string;
  vaiTro: string;
  dayTroId?: number;
  tenNganHang?: string;
  soTaiKhoan?: string;
  tenTaiKhoan?: string;
}

export interface LoginResponse {
  token: string;
  Token?: string; 
  user: User;
  User?: User; 
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  public currentUser$ = this.currentUserSubject.asObservable();

  constructor(private http: HttpClient) {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    if (token && userStr) {
      this.currentUserSubject.next(JSON.parse(userStr));
    }
  }

  login(username: string, password: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/Auth/login`, { username, password })
      .pipe(
        tap(response => {
          const token = response.Token || response.token;
          const user = response.User || response.user;
          if (token && user) {
            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            this.currentUserSubject.next(user);
          }
        })
      );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.currentUserSubject.next(null);
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getCurrentUser(): User | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.vaiTro === role || user?.vaiTro === 'Admin';
  }

  changePassword(oldPassword: string, newPassword: string): Observable<any> {
    return this.http.post(`${API_URL}/Auth/change-password`, { oldPassword, newPassword });
  }

  updateProfile(data: any): Observable<any> {
    return this.http.put(`${API_URL}/Auth/profile`, data);
  }

  getProfile(): Observable<User> {
    return this.http.get<User>(`${API_URL}/Auth/profile`);
  }

  registerOwner(data: {
    email: string;
    password: string;
    hoTen: string;
    soDienThoai: string;
  }): Observable<any> {
    return this.http.post(`${API_URL}/Auth/register-owner`, data);
  }

  registerTenant(data: {
    email: string;
    password: string;
    otpCode: string;
    hoTen: string;
    soDienThoai: string;
  }): Observable<any> {
    return this.http.post(`${API_URL}/Auth/register-tenant`, data);
  }

  loginWithOtp(email: string, otpCode: string): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${API_URL}/Auth/login-with-otp`, {
      email: email,
      otpCode: otpCode
    }).pipe(
      tap(response => {
        const token = response.Token || response.token;
        const user = response.User || response.user;
        if (token && user) {
          localStorage.setItem('token', token);
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
        }
      })
    );
  }

  requestChangePasswordOtp(oldPassword: string): Observable<any> {
    return this.http.post(`${API_URL}/Auth/request-change-password-otp`, { oldPassword });
  }

  confirmChangePassword(otpCode: string, newPassword: string): Observable<any> {
    return this.http.post(`${API_URL}/Auth/confirm-change-password`, { otpCode, newPassword });
  }
  
  updateUserState(user: User): void {
    const storedUser = JSON.parse(localStorage.getItem('user') || '{}');
    const updatedUser = { ...storedUser, ...user };
    
    localStorage.setItem('user', JSON.stringify(updatedUser));
    this.currentUserSubject.next(updatedUser);
    console.log('✅ Đã cập nhật LocalStorage:', updatedUser);
  }
}