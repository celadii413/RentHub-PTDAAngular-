import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OtpService } from '../../services/otp.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
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
  forgotStep = 1;
  isSendingForgotOtp = false;
  isResettingPassword = false;

  constructor(
    private authService: AuthService,
    private otpService: OtpService,
    private router: Router,
    private route: ActivatedRoute,
    private toastService: ToastService
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
      this.toastService.warning('Vui lòng nhập đầy đủ thông tin');
      return;
    }
    this.isLoading = true;
    this.authService.login(this.username, this.password).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.toastService.success('Đăng nhập thành công! Chào mừng trở lại.');
        if (response.user.vaiTro === 'Người thuê') this.router.navigate(['/tenant']);
        else this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Đăng nhập thất bại';
        if (err.status >= 500) this.toastService.error('Lỗi kết nối Server!');
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

  switchToForgot() {
    this.loginMethod = 'forgot';
    this.forgotStep = 1;
    this.errorMessage = '';
    this.successMessage = '';
  }

  sendForgotOtp() {
    if (!this.forgotEmail) {
      this.errorMessage = 'Vui lòng nhập email';
      return;
    }
    this.isSendingForgotOtp = true;
    this.errorMessage = '';

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

    this.authService.resetPassword(this.forgotEmail, this.forgotOtpCode, this.newPassword).subscribe({
      next: () => {
        this.isResettingPassword = false;
        this.toastService.success('Đặt lại mật khẩu thành công! Vui lòng đăng nhập lại.');
        this.switchLoginMethod('password');
      },
      error: (err) => {
        this.isResettingPassword = false;
        this.toastService.error(err.error?.message || 'Mã OTP không đúng hoặc đã hết hạn.');
      }
    });
  }
}