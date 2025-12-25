import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  constructor(private authService: AuthService) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const token = this.authService.getToken();
    
    if (token) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${token}`
        }
      });
      console.log('✅ Token được gửi kèm request:', req.url);
    } else {
      console.warn('⚠️ Không có token cho request:', req.url);
    }

    return next.handle(req).pipe(
      tap({
        error: (err) => {
          if (err.status === 401) {
            console.error('❌ 401 Unauthorized - Token có thể không hợp lệ hoặc đã hết hạn');
            console.error('Token hiện tại:', token ? token.substring(0, 20) + '...' : 'null');
          }
        }
      })
    );
  }
}

