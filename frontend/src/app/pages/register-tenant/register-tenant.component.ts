import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OtpService } from '../../services/otp.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register-tenant',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register-tenant.component.html', 
  styleUrls: ['./register-tenant.component.css']   
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
    private router: Router,
    private toastService: ToastService 
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