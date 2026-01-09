import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { OtpService } from '../../services/otp.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './register.component.html', 
  styleUrls: ['./register.component.css']  
})
export class RegisterComponent {
  step = 1; 
  registerData = { 
    email: '', 
    password: '', 
    confirmPassword: '', 
    hoTen: '', 
    soDienThoai: '' 
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

  constructor(private authService: AuthService, private otpService: OtpService, private router: Router, private toastService: ToastService ) {
    if (this.authService.isAuthenticated()) this.router.navigate(['/dashboard']);
  }

  sendOtp() {
    if (!this.registerData.email) { this.errorMessage = 'Vui lòng nhập email'; return; }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.registerData.email)) { this.errorMessage = 'Email không hợp lệ'; return; }
    
    this.errorMessage = ''; this.successMessage = ''; this.isSendingOtp = true;
    
    this.otpService.sendOtp(this.registerData.email, 'Register').subscribe({
      next: () => { 
        this.isSendingOtp = false; 
        this.successMessage = 'Đã gửi mã OTP'; 
        this.step = 2; 
        this.startResendCountdown(); 
      },
      error: (err) => { 
        this.isSendingOtp = false; 
        this.errorMessage = err.error?.message || 'Không thể gửi mã OTP. Vui lòng thử lại.'; 
      }
    });
  }

  verifyOtp() {
    if (this.otpCode.length !== 6) { this.errorMessage = 'Mã OTP phải có 6 số'; return; }
    this.errorMessage = ''; this.isVerifyingOtp = true;
    this.otpService.verifyOtp(this.registerData.email, this.otpCode, 'Register').subscribe({
      next: (res) => {
        this.isVerifyingOtp = false;
        if (res.verified) { this.otpVerified = true; this.successMessage = 'Xác thực thành công!'; setTimeout(() => { this.step = 3; this.successMessage = ''; }, 1000); }
        else { this.errorMessage = 'Mã OTP sai'; }
      },
      error: (err) => { this.isVerifyingOtp = false; this.errorMessage = err.error?.message || 'Lỗi xác thực'; }
    });
  }

  onOtpInput() { this.otpCode = this.otpCode.replace(/[^0-9]/g, ''); this.errorMessage = ''; }
  resendOtp() {
    if (this.resendCountdown > 0) return;
    this.isResendingOtp = true; this.errorMessage = '';
    this.otpService.sendOtp(this.registerData.email, 'Register').subscribe({
      next: () => { this.isResendingOtp = false; this.successMessage = 'Đã gửi lại mã'; this.otpCode = ''; this.startResendCountdown(); },
      error: (err) => { this.isResendingOtp = false; this.errorMessage = err.error?.message || 'Lỗi gửi lại'; }
    });
  }

  startResendCountdown() { 
    this.resendCountdown = 60; 
    const interval = setInterval(() => { this.resendCountdown--; if (this.resendCountdown <= 0) clearInterval(interval); }, 1000); 
  }
  backToStep1() { 
    this.step = 1; 
    this.otpCode = ''; 
    this.errorMessage = ''; 
  }

  isFormValid() { 
    return !!(this.registerData.email && this.registerData.password.length >= 6 && this.registerData.hoTen && this.registerData.soDienThoai && this.otpVerified); 
  }

  onRegister() {
    if (!this.isFormValid()) { this.errorMessage = 'Vui lòng điền đủ thông tin'; return; }
    this.isLoading = true; this.errorMessage = '';
    this.authService.registerOwner(this.registerData).subscribe({
      next: () => {
        this.isLoading = false; this.successMessage = 'Đăng ký thành công! Chuyển hướng...';
        setTimeout(() => this.router.navigate(['/login'], { queryParams: { email: this.registerData.email, message: 'Đăng ký thành công!' } }), 2000);
      },
      error: (err) => { this.isLoading = false; this.errorMessage = err.error?.message || 'Lỗi đăng ký'; }
    });
  }
}