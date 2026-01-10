import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { User } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  activeTab = 'info';
  loading = false;

  profileForm: any = {
    email: '',
    hoTen: '',
    soDienThoai: '',
    tenNganHang: '',
    soTaiKhoan: '',
    tenTaiKhoan: ''
  };

  passwordStep = 1;
  passwordForm = {
    oldPassword: '',
    otpCode: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(private authService: AuthService, private toastService: ToastService) { }

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.authService.getProfile().subscribe(user => {
      this.currentUser = user;
      this.profileForm = {
        email: user.email,
        hoTen: user.hoTen,
        soDienThoai: user.soDienThoai,
        tenNganHang: user.tenNganHang || '',
        soTaiKhoan: user.soTaiKhoan || '',
        tenTaiKhoan: user.tenTaiKhoan || ''
      };
      this.authService.updateUserState(user);
    });
  }

  getInitials() {
    return this.currentUser?.hoTen?.charAt(0).toUpperCase() || 'U';
  }

  updateProfile() {
    if (!this.profileForm.hoTen || this.profileForm.hoTen.trim().length < 2) {
      this.toastService.warning('Họ tên không được để trống và phải có ít nhất 2 ký tự');
      return;
    }

    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(this.profileForm.soDienThoai)) {
      this.toastService.warning('Số điện thoại không hợp lệ (phải là số và có 10-11 chữ số)');
      return;
    }

    if (this.profileForm.soTaiKhoan) {
      const accRegex = /^[0-9]+$/;
      if (!accRegex.test(this.profileForm.soTaiKhoan)) {
        this.toastService.warning('Số tài khoản ngân hàng chỉ được chứa chữ số');
        return;
      }
    }

    if (!this.profileForm.email && this.currentUser) {
      this.profileForm.email = this.currentUser.email;
    }

    this.loading = true;
    this.authService.updateProfile(this.profileForm).subscribe({
      next: () => {
        this.loading = false;
        this.toastService.success('Cập nhật thông tin hồ sơ thành công!');
        this.loadProfile();
      },
      error: (err) => {
        this.loading = false;
        this.toastService.error(err.error?.message || 'Lỗi cập nhật hồ sơ');
      }
    });
  }

  onlyNumberKey(event: any) {
    const charCode = (event.which) ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      return false;
    }
    return true;
  }

  verifyOldPassword() {
    this.authService.requestChangePasswordOtp(this.passwordForm.oldPassword).subscribe({
      next: () => this.passwordStep = 2,
      error: (err) => this.toastService.error(err.error?.message || 'Mật khẩu cũ không đúng')
    });
  }

  submitNewPassword() {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      this.toastService.warning('Mật khẩu nhập lại không khớp!');
      return;
    }

    const data = {
      email: this.currentUser?.email || '',
      otpCode: this.passwordForm.otpCode,
      newPassword: this.passwordForm.newPassword
    };

    this.authService.confirmChangePassword(data).subscribe({
      next: () => {
        this.toastService.success('Đổi mật khẩu thành công!');
        this.passwordStep = 1;
        this.passwordForm = { oldPassword: '', otpCode: '', newPassword: '', confirmPassword: '' };
      },
      error: (err) => this.toastService.error(err.error?.message || 'Mã OTP không đúng')
    });
  }
}