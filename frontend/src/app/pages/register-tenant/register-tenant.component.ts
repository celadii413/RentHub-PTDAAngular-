import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OtpService } from '../../services/otp.service';

@Component({
  selector: 'app-register-tenant',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
      <!-- NAVBAR -->
      <header class="auth-navbar">
        <div class="container d-flex justify-between align-items-center">
           <a routerLink="/" class="logo">
              <i class='bx bxs-building-house text-primary'></i> <span>RoomManager</span>
           </a>
        </div>
      </header>

      <div class="auth-content-container">
        <div class="auth-card">
          <div class="auth-header">
            <div class="logo-circle" style="background: rgba(236,72,153,0.1); color: #ec4899;"><i class='bx bx-user-pin'></i></div>
            <h1>Đăng Ký Người Thuê</h1>
            <p>Tạo tài khoản để xem phòng và hóa đơn</p>
          </div>

          <!-- STEP 1 -->
          <div *ngIf="step === 1">
            <form (ngSubmit)="sendOtp()">
              <div class="form-group">
                <label class="form-label">Email <span class="text-danger">*</span></label>
                <div class="input-icon">
                   <i class='bx bx-envelope'></i>
                   <input type="email" class="form-control" [(ngModel)]="registerData.email" name="email" required placeholder="email@example.com" [disabled]="isSendingOtp">
                </div>
              </div>
              <div class="alert-error" *ngIf="errorMessage"><i class='bx bx-error-circle'></i> {{ errorMessage }}</div>
              <button type="submit" class="btn btn-primary w-100" [disabled]="!registerData.email || isSendingOtp">{{ isSendingOtp ? 'Đang gửi...' : 'Gửi OTP' }}</button>
            </form>
          </div>

          <!-- STEP 2 -->
          <div *ngIf="step === 2">
            <div class="text-center mb-4"><p class="text-muted">Nhập OTP gửi tới <strong>{{registerData.email}}</strong></p></div>
            <form (ngSubmit)="verifyOtp()">
              <div class="form-group"><input type="text" class="form-control otp-input" [(ngModel)]="otpCode" name="otp" maxlength="6" placeholder="000000" (input)="onOtpInput()"></div>
              <div class="text-center mb-3"><button type="button" class="btn-link" (click)="resendOtp()" [disabled]="resendCountdown > 0">Gửi lại mã</button></div>
              <div class="alert-error" *ngIf="errorMessage">{{ errorMessage }}</div>
              <button type="submit" class="btn btn-primary w-100" [disabled]="otpCode.length !== 6">Xác thực</button>
              <button type="button" class="btn btn-outline w-100 mt-2" (click)="backToStep1()">Quay lại</button>
            </form>
          </div>

          <!-- STEP 3 -->
          <div *ngIf="step === 3">
            <form (ngSubmit)="onRegister()">
              <div class="form-group"><label class="form-label">Email</label><input class="form-control disabled-input" [value]="registerData.email" disabled></div>
              <div class="form-group"><label class="form-label">Mật khẩu</label><input type="password" class="form-control" [(ngModel)]="registerData.password" name="pass" required minlength="6"></div>
              <div class="form-group">
                  <label class="form-label">Nhập lại mật khẩu</label>
                  <input type="password" class="form-control" [(ngModel)]="registerData.confirmPassword" name="confPass" required>
                  <small class="text-danger" *ngIf="registerData.password !== registerData.confirmPassword && registerData.confirmPassword">
                    Mật khẩu nhập lại không khớp
                </small>
              </div>
              <div class="form-group"><label class="form-label">Họ tên</label><input class="form-control" [(ngModel)]="registerData.hoTen" name="name" required></div>
              <div class="form-group"><label class="form-label">SĐT</label><input class="form-control" [(ngModel)]="registerData.soDienThoai" name="phone" required></div>
              <button type="submit" class="btn btn-primary w-100" [disabled]="!isFormValid() || isLoading">{{ isLoading ? 'Đang xử lý...' : 'Đăng Ký' }}</button>
            </form>
          </div>

          <div class="auth-footer">
            <p>Đã có tài khoản? <a routerLink="/login">Đăng nhập ngay</a></p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper { min-height: 100vh; display: flex; flex-direction: column; background: var(--bg-body); transition: 0.3s; }
    .auth-navbar { padding: 20px 0; border-bottom: 1px solid var(--border); background: var(--bg-card); }
    .logo { font-size: 22px; font-weight: 700; display: flex; align-items: center; gap: 10px; color: var(--text-main); text-decoration: none; }
    .text-primary { color: var(--primary); }
    .auth-content-container { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 20px; }
    .auth-card { width: 100%; max-width: 460px; background: var(--bg-card); padding: 40px; border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow); }
    .auth-header { text-align: center; margin-bottom: 30px; }
    .logo-circle { width: 56px; height: 56px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px; }
    .auth-header h1 { font-size: 22px; color: var(--text-main); margin: 0 0 8px; }
    .auth-header p { color: var(--text-muted); font-size: 14px; margin: 0; }
    .input-icon { position: relative; } .input-icon i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 18px; } .input-icon input { padding-left: 40px; }
    .w-100 { width: 100%; padding: 12px; font-size: 15px; margin-top: 10px; }
    .otp-input { text-align: center; font-size: 24px; letter-spacing: 6px; font-weight: 700; padding: 12px; }
    .btn-link { background: none; border: none; color: var(--primary); cursor: pointer; font-size: 13px; text-decoration: underline; }
    .alert-error { background: var(--danger-bg); color: var(--danger-text); padding: 12px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
    .auth-footer { text-align: center; margin-top: 24px; border-top: 1px solid var(--border); padding-top: 20px; font-size: 13px; color: var(--text-muted); }
    .auth-footer a { color: var(--primary); text-decoration: none; font-weight: 600; }
    .disabled-input { background: var(--bg-body) !important; color: var(--text-muted) !important; cursor: not-allowed; }
  `]
})
export class RegisterTenantComponent {
  step = 1;

  registerData = {
    email: '',
    password: '',
    confirmPassword: '',
    hoTen: '',
    soDienThoai: '',
    otpCode: ''
  };

  otpCode = '';
  errorMessage = '';
  successMessage = '';
  isSendingOtp = false;
  isVerifyingOtp = false;
  isLoading = false;
  isResendingOtp = false;
  resendCountdown = 0;
  otpVerified = false;

  constructor(
    private authService: AuthService,
    private otpService: OtpService,
    private router: Router
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  sendOtp() {
    if (!this.registerData.email) {
      this.errorMessage = 'Vui lòng nhập email';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) {
      this.errorMessage = 'Email không hợp lệ';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isSendingOtp = true;

    this.otpService.sendOtp(this.registerData.email, 'Register').subscribe({
      next: (response) => {
        console.log('OTP sent:', response);
        this.isSendingOtp = false;
        this.successMessage = 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.';
        this.step = 2;
        this.startResendCountdown();
      },
      error: (err) => {
        console.error('Send OTP error:', err);
        this.isSendingOtp = false;
        this.errorMessage = err.error?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.';
      }
    });
  }


  verifyOtp() {
    if (this.otpCode.length !== 6) {
      this.errorMessage = 'Mã OTP phải có 6 chữ số';
      return;
    }

    this.errorMessage = '';
    this.registerData.otpCode = this.otpCode;
    this.otpVerified = true;
    this.successMessage = 'Vui lòng điền thông tin để hoàn tất đăng ký';
    this.step = 3;
    this.successMessage = '';
  }

  onOtpInput() {
    this.otpCode = this.otpCode.replace(/[^0-9]/g, '');
    this.errorMessage = '';
  }

  resendOtp() {
    if (this.resendCountdown > 0) return;

    this.isResendingOtp = true;
    this.errorMessage = '';

    this.otpService.sendOtp(this.registerData.email, 'Register').subscribe({
      next: (response) => {
        this.isResendingOtp = false;
        this.successMessage = 'Mã OTP mới đã được gửi. Vui lòng kiểm tra email.';
        this.otpCode = '';
        this.startResendCountdown();
        setTimeout(() => {
          this.successMessage = '';
        }, 3000);
      },
      error: (err) => {
        this.isResendingOtp = false;
        this.errorMessage = err.error?.message || 'Không thể gửi lại mã OTP';
      }
    });
  }

  startResendCountdown() {
    this.resendCountdown = 60;
    const interval = setInterval(() => {
      this.resendCountdown--;
      if (this.resendCountdown <= 0) {
        clearInterval(interval);
      }
    }, 1000);
  }

  backToStep1() {
    this.step = 1;
    this.otpCode = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  backToStep2() {
    this.step = 2;
    this.errorMessage = '';
    this.successMessage = '';
  }

  isFormValid(): boolean {
    return !!(
      this.registerData.email &&
      this.registerData.password &&
      this.registerData.password.length >= 6 &&
      this.registerData.hoTen &&
      this.registerData.soDienThoai &&
      this.otpVerified
    );
  }

  onRegister() {
    if (!this.isFormValid()) {
      this.errorMessage = 'Vui lòng điền đầy đủ thông tin';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isLoading = true;

    this.authService.registerTenant({
      email: this.registerData.email,
      password: this.registerData.password,
      otpCode: this.registerData.otpCode,
      hoTen: this.registerData.hoTen,
      soDienThoai: this.registerData.soDienThoai
    }).subscribe({
      next: (response) => {
        console.log('Register successful:', response);
        this.isLoading = false;
        this.successMessage = 'Đăng ký thành công! Đang chuyển đến trang đăng nhập...';

        setTimeout(() => {
          this.router.navigate(['/login'], {
            queryParams: {
              email: this.registerData.email,
              message: 'Đăng ký thành công! Vui lòng đăng nhập.'
            }
          });
        }, 2000);
      },
      error: (err) => {
        console.error('Register error:', err);
        this.isLoading = false;
        if (err.status === 0) {
          this.errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra backend đã chạy chưa.';
        } else if (err.status === 400) {
          this.errorMessage = err.error?.message || 'Đăng ký thất bại. Vui lòng kiểm tra lại mã OTP.';
        } else {
          this.errorMessage = err.error?.message || 'Đăng ký thất bại. Vui lòng thử lại.';
        }
      }
    });
  }
}