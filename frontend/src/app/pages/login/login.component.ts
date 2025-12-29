import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OtpService } from '../../services/otp.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="auth-wrapper">
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
              <div class="logo-circle"><i class='bx bxs-building-house'></i></div>
              <h1>Chào mừng trở lại!</h1>
              <p>Đăng nhập để quản lý hệ thống nhà trọ</p>
            </div>

            <!-- Tab chuyển đổi -->
            <div class="login-tabs">
              <button class="tab-button" [class.active]="loginMethod === 'password'" (click)="switchLoginMethod('password')"><i class='bx bx-lock-alt'></i> Mật khẩu</button>
              <button class="tab-button" [class.active]="loginMethod === 'otp'" (click)="switchLoginMethod('otp')"><i class='bx bx-envelope'></i> OTP Email</button>
            </div>

            <!-- Form Password -->
            <form (ngSubmit)="onLogin()" *ngIf="loginMethod === 'password' && !isLoading">
              <div class="form-group">
                <label class="form-label">Tên đăng nhập / Email</label>
                <div class="input-icon"><i class='bx bx-user'></i><input type="text" class="form-control" [(ngModel)]="username" name="username" required placeholder="Nhập username hoặc email"></div>
              </div>
              <div class="form-group">
                <label class="form-label">Mật khẩu</label>
                <div class="input-icon"><i class='bx bx-key'></i><input type="password" class="form-control" [(ngModel)]="password" name="password" required placeholder="Nhập mật khẩu"></div>
              </div>
              <div class="text-right mb-3">
                <a (click)="switchToForgot()" class="btn-link" style="font-size: 13px; cursor: pointer;">Quên mật khẩu?</a>
              </div>
              <div class="alert-error" *ngIf="errorMessage"><i class='bx bx-error-circle'></i> {{ errorMessage }}</div>
              <button type="submit" class="btn btn-primary btn-block">Đăng nhập ngay <i class='bx bx-right-arrow-alt'></i></button>
              <div class="auth-footer">
                <p>Chưa có tài khoản? <a routerLink="/register">Đăng ký Chủ trọ</a></p>
                <p style="margin-top: 10px;">Bạn là người thuê? <a routerLink="/register-tenant">Đăng ký tại đây</a></p>
              </div>
            </form>

            <!-- Form OTP -->
            <div *ngIf="loginMethod === 'otp' && !isLoading">
              <!-- STEP 1 -->
              <div *ngIf="otpStep === 1">
                <form (ngSubmit)="sendLoginOtp()">
                  <div class="form-group">
                    <label class="form-label">Email nhận OTP <span style="color:red">*</span></label>
                    <div class="input-icon"><i class='bx bx-envelope'></i><input type="email" class="form-control" [(ngModel)]="loginEmail" name="loginEmail" required placeholder="name@example.com" [disabled]="isSendingOtp"></div>
                  </div>
                  <div class="alert-error" *ngIf="errorMessage"><i class='bx bx-error-circle'></i> {{ errorMessage }}</div>
                  <div class="alert-success" *ngIf="successMessage"><i class='bx bx-check-circle'></i> {{ successMessage }}</div>
                  <button type="submit" class="btn btn-primary btn-block" [disabled]="!loginEmail || isSendingOtp">
                    <i class='bx' [ngClass]="isSendingOtp ? 'bx-loader-alt bx-spin' : 'bx-send'"></i> 
                    {{ isSendingOtp ? 'Đang gửi...' : 'Gửi Mã OTP' }}
                  </button>
                </form>
              </div>

              <!-- STEP 2 -->
              <div *ngIf="otpStep === 2">
                <div class="text-center mb-4"><p class="text-muted mb-1">Mã OTP 6 số đã được gửi tới</p><strong style="color: var(--text-main); font-size: 16px;">{{ loginEmail }}</strong></div>
                <form (ngSubmit)="loginWithOtp()">
                  <div class="form-group mb-3"><input type="text" class="form-control otp-input" [(ngModel)]="loginOtpCode" name="loginOtpCode" required placeholder="000000" maxlength="6" pattern="[0-9]{6}" (input)="onOtpInput()" [disabled]="isVerifyingOtp"></div>
                  <div class="form-group text-center mb-4"><button type="button" class="btn-link" (click)="resendLoginOtp()" [disabled]="isResendingOtp || resendCountdown > 0"><span *ngIf="resendCountdown === 0 && !isResendingOtp">Gửi lại mã</span><span *ngIf="isResendingOtp">Đang gửi...</span><span *ngIf="resendCountdown > 0">Gửi lại sau {{ resendCountdown }}s</span></button></div>
                  <div class="alert-error mb-3" *ngIf="errorMessage"><i class='bx bx-error'></i> {{ errorMessage }}</div>
                  <button type="submit" class="btn btn-primary btn-block mb-3" [disabled]="loginOtpCode.length !== 6 || isVerifyingOtp">{{ isVerifyingOtp ? 'Đang xử lý...' : 'Xác thực & Đăng nhập' }}</button>
                  <button type="button" class="btn btn-outline btn-block" (click)="backToSendOtp()">Quay lại</button>
                </form>
              </div>
            </div>

            <!-- Form Quên mật khẩu -->
            <div *ngIf="loginMethod === 'forgot' && !isLoading">
              <div class="auth-header">
                <h2>Đặt lại mật khẩu</h2>
              </div>

              <!-- Bước 1: Nhập Email -->
              <div *ngIf="forgotStep === 1">
                <div class="form-group">
                  <label class="form-label">Nhập Email tài khoản</label>
                  <div class="input-icon">
                    <i class='bx bx-envelope'></i>
                    <input type="email" class="form-control" [(ngModel)]="forgotEmail" name="forgotEmail" placeholder="email@example.com">
                  </div>
                </div>
                <div class="alert-error" *ngIf="errorMessage">{{ errorMessage }}</div>
                <button class="btn btn-primary btn-block" (click)="sendForgotOtp()" [disabled]="isSendingForgotOtp">
                  {{ isSendingForgotOtp ? 'Đang gửi...' : 'Tiếp tục' }}
                </button>
              </div>

              <!-- Bước 2: Nhập OTP và Pass mới -->
              <div *ngIf="forgotStep === 2">
                <div class="form-group">
                  <label class="form-label">Mã OTP xác thực</label>
                  <input type="text" class="form-control text-center font-bold" [(ngModel)]="forgotOtpCode" name="fOtp" maxlength="6" placeholder="000000" style="letter-spacing: 5px; font-size: 20px;">
                </div>
                <div class="form-group">
                  <label class="form-label">Mật khẩu mới</label>
                  <input type="password" class="form-control" [(ngModel)]="newPassword" name="newP" placeholder="Tối thiểu 6 ký tự">
                </div>
                <div class="form-group">
                  <label class="form-label">Xác nhận mật khẩu</label>
                  <input type="password" class="form-control" [(ngModel)]="confirmNewPassword" name="cNewP">
                </div>
                <div class="alert-error" *ngIf="errorMessage">{{ errorMessage }}</div>
                <button class="btn btn-primary btn-block" (click)="onResetPassword()" [disabled]="isResettingPassword">
                  {{ isResettingPassword ? 'Đang xử lý...' : 'Xác nhận thay đổi' }}
                </button>
              </div>

              <button class="btn btn-outline btn-block mt-3" (click)="switchLoginMethod('password')">Quay lại đăng nhập</button>
            </div>
          </div>
      </div>
    </div>
  `,
  styles: [`
    .auth-wrapper { min-height: 100vh; display: flex; flex-direction: column; background: var(--bg-body); transition: 0.3s; }
    .auth-navbar { padding: 20px 0; border-bottom: 1px solid var(--border); background: var(--bg-card); }
    .logo { font-size: 22px; font-weight: 700; display: flex; align-items: center; gap: 10px; color: var(--text-main); text-decoration: none; cursor: pointer; }
    .text-primary { color: var(--primary); }
    .auth-content-container { flex: 1; display: flex; align-items: center; justify-content: center; padding: 40px 20px; }
    .auth-card { width: 100%; max-width: 440px; background: var(--bg-card); padding: 40px; border-radius: 16px; border: 1px solid var(--border); box-shadow: var(--shadow); }
    .auth-header { text-align: center; margin-bottom: 30px; }
    .logo-circle { width: 56px; height: 56px; background: rgba(99, 102, 241, 0.1); color: var(--primary); border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; margin: 0 auto 16px; }
    .auth-header h1 { font-size: 24px; font-weight: 700; color: var(--text-main); margin-bottom: 8px; }
    .auth-header p { color: var(--text-muted); font-size: 14px; margin: 0; }
    .login-tabs { display: flex; background: var(--bg-input); padding: 4px; border-radius: 8px; margin-bottom: 24px; }
    .tab-button { flex: 1; padding: 10px; background: none; border: none; color: var(--text-muted); font-size: 13px; font-weight: 500; cursor: pointer; border-radius: 6px; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 6px; }
    .tab-button.active { background: var(--bg-card); color: var(--text-main); box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
    .input-icon { position: relative; } .input-icon i { position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 18px; } .input-icon input { padding-left: 40px; }
    .btn-block { width: 100%; padding: 12px; font-size: 15px; margin-top: 10px; }
    .mt-2 { margin-top: 10px; }
    .mb-1 { margin-bottom: 4px; } .mb-3 { margin-bottom: 12px; } .mb-4 { margin-bottom: 24px; }
    .alert-error { background-color: var(--danger-bg); color: var(--danger-text); padding: 12px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .alert-success { background-color: var(--success-bg); color: var(--success-text); padding: 12px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }
    .otp-input { text-align: center; font-size: 28px; letter-spacing: 10px; font-weight: 700; padding: 14px; height: 60px; }
    .btn-link { background: none; border: none; color: var(--primary); cursor: pointer; font-size: 14px; text-decoration: none; padding: 5px; }
    .btn-link:disabled { color: var(--text-muted); cursor: not-allowed; }
    .auth-footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid var(--border); }
    .auth-footer p { color: var(--text-muted); font-size: 13px; margin: 0; }
    .auth-footer a { color: var(--primary); text-decoration: none; font-weight: 600; }
  `]
})
export class LoginComponent implements OnInit {
  loginMethod: 'password' | 'otp' | 'forgot' = 'password';
  username = '';
  password = '';
  loginEmail = '';
  loginOtpCode = '';
  otpStep = 1; 
  errorMessage = '';
  successMessage = '';
  isLoading = false;
  isSendingOtp = false;
  isVerifyingOtp = false;
  isResendingOtp = false;
  resendCountdown = 0;
  forgotEmail = '';
  forgotOtpCode = '';
  newPassword = '';
  confirmNewPassword = '';
  forgotStep = 1; // 1: Nhập email, 2: Nhập OTP & Pass mới
  isSendingForgotOtp = false;
  isResettingPassword = false;

  constructor(
    private authService: AuthService,
    private otpService: OtpService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['email']) {
        this.username = params['email'];
        this.loginEmail = params['email'];
      }
      if (params['message']) {
        console.log('Success message:', params['message']);
      }
    });
  }

  switchLoginMethod(method: 'password' | 'otp') {
    this.loginMethod = method;
    this.errorMessage = '';
    this.successMessage = '';
    this.otpStep = 1;
    this.loginOtpCode = '';
  }

  onLogin() {
    if (!this.username || !this.password) {
      this.errorMessage = 'Vui lòng nhập đầy đủ thông tin';
      return;
    }

    this.errorMessage = '';
    this.isLoading = true;

    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        console.log('Login successful:', response);
        this.isLoading = false;

        if (response.user.vaiTro === 'Người thuê') {
          this.router.navigate(['/tenant']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Login error:', err);
        this.isLoading = false;
        if (err.status === 0) {
          this.errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra backend đã chạy chưa.';
        } else if (err.status === 401) {
          this.errorMessage = err.error?.message || 'Tên đăng nhập hoặc mật khẩu không đúng';
        } else {
          this.errorMessage = err.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
        }
      }
    });
  }

  sendLoginOtp() {
    if (!this.loginEmail) {
      this.errorMessage = 'Vui lòng nhập email';
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.loginEmail)) {
      this.errorMessage = 'Email không hợp lệ';
      return;
    }

    this.errorMessage = '';
    this.successMessage = '';
    this.isSendingOtp = true;

    this.otpService.sendOtp(this.loginEmail, 'Login').subscribe({
      next: (response) => {
        console.log('OTP sent:', response);
        this.isSendingOtp = false;
        this.successMessage = 'Mã OTP đã được gửi đến email của bạn. Vui lòng kiểm tra hộp thư.';
        this.otpStep = 2;
        this.startResendCountdown();
      },
      error: (err) => {
        console.error('Send OTP error:', err);
        this.isSendingOtp = false;
        this.errorMessage = err.error?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.';
      }
    });
  }

  loginWithOtp() {
    if (this.loginOtpCode.length !== 6) {
      this.errorMessage = 'Mã OTP phải có 6 chữ số';
      return;
    }

    this.errorMessage = '';
    this.isVerifyingOtp = true;

    this.authService.loginWithOtp(this.loginEmail, this.loginOtpCode).subscribe({
      next: (response) => {
        console.log('Login with OTP successful:', response);
        this.isVerifyingOtp = false;

        if (response.user.vaiTro === 'Người thuê') {
          this.router.navigate(['/tenant']);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err) => {
        console.error('Login with OTP error:', err);
        this.isVerifyingOtp = false;
        if (err.status === 0) {
          this.errorMessage = 'Không thể kết nối đến server. Vui lòng kiểm tra backend đã chạy chưa.';
        } else if (err.status === 401) {
          this.errorMessage = err.error?.message || 'Email hoặc mã OTP không đúng';
        } else {
          this.errorMessage = err.error?.message || 'Đăng nhập thất bại. Vui lòng thử lại.';
        }
      }
    });
  }

  onOtpInput() {
    this.loginOtpCode = this.loginOtpCode.replace(/[^0-9]/g, '');
    this.errorMessage = '';
  }

  resendLoginOtp() {
    if (this.resendCountdown > 0) return;

    this.isResendingOtp = true;
    this.errorMessage = '';

    this.otpService.sendOtp(this.loginEmail, 'Login').subscribe({
      next: (response) => {
        this.isResendingOtp = false;
        this.successMessage = 'Mã OTP mới đã được gửi. Vui lòng kiểm tra email.';
        this.loginOtpCode = '';
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

  backToSendOtp() {
    this.otpStep = 1;
    this.loginOtpCode = '';
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Chuyển sang chế độ quên mật khẩu
  switchToForgot() {
    this.loginMethod = 'forgot';
    this.forgotStep = 1;
    this.errorMessage = '';
    this.successMessage = '';
  }

  // Bước 1: Gửi OTP quên mật khẩu
  sendForgotOtp() {
    if (!this.forgotEmail) {
      this.errorMessage = 'Vui lòng nhập email';
      return;
    }
    this.isSendingForgotOtp = true;
    this.errorMessage = '';
    
    // Dùng OTP với mục đích "ResetPassword" (Backend của bạn đã hỗ trợ loại này)
    this.otpService.sendOtp(this.forgotEmail, 'ResetPassword' as any).subscribe({
      next: () => {
        this.isSendingForgotOtp = false;
        this.forgotStep = 2;
        this.successMessage = 'Mã xác thực đã được gửi đến Email của bạn.';
      },
      error: (err) => {
        this.isSendingForgotOtp = false;
        this.errorMessage = err.error?.message || 'Email không tồn tại trong hệ thống.';
      }
    });
  }

  // Bước 2: Xác nhận OTP và đặt mật khẩu mới
  onResetPassword() {
    if (this.newPassword !== this.confirmNewPassword) {
      this.errorMessage = 'Mật khẩu xác nhận không khớp';
      return;
    }
    if (this.newPassword.length < 6) {
      this.errorMessage = 'Mật khẩu phải có ít nhất 6 ký tự';
      return;
    }

    this.isResettingPassword = true;
    // Chúng ta sẽ dùng chung logic ChangePasswordWithOtp của bạn nhưng áp dụng cho luồng quên mật khẩu
    this.authService.confirmChangePassword(this.forgotOtpCode, this.newPassword).subscribe({
      next: () => {
        this.isResettingPassword = false;
        alert('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
        this.switchLoginMethod('password');
      },
      error: (err) => {
        this.isResettingPassword = false;
        this.errorMessage = err.error?.message || 'Mã OTP không đúng hoặc đã hết hạn.';
      }
    });
  }
}