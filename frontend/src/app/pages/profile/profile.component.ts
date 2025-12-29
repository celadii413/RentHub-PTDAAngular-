import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../services/auth.service'; 
import { User } from '../../services/api.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1><i class='bx bx-id-card text-gradient'></i> Hồ Sơ Cá Nhân</h1>
      </div>

      <div class="profile-layout">
         <!-- Left Sidebar -->
         <div class="card text-center p-4">
            <div class="avatar-lg">{{ getInitials() }}</div>
            <h2 class="mt-4 mb-2 text-main" style="font-size: 20px;">{{ currentUser?.hoTen }}</h2>
            <div class="badge badge-info mb-4">{{ currentUser?.vaiTro }}</div>
            
            <div class="menu-stack">
               <button class="btn-menu" [class.active]="activeTab==='info'" (click)="activeTab='info'">
                  <i class='bx bx-user'></i> Thông tin chung
               </button>
               <button class="btn-menu" [class.active]="activeTab==='password'" (click)="activeTab='password'">
                  <i class='bx bx-lock-alt'></i> Đổi mật khẩu
               </button>
            </div>
         </div>

         <!-- Right Content -->
         <div class="card p-5" style="padding: 40px;">
            
            <!-- Tab Info -->
            <div *ngIf="activeTab === 'info'" class="fade-in">
               <h3 class="mb-4 pb-3 border-bottom" style="font-size: 18px; color: var(--text-main);">Thông tin tài khoản</h3>
               <form (ngSubmit)="updateProfile()">
                  <div class="grid-2 gap-4 mb-4">
                     <div class="form-group">
                        <label class="form-label">Tên đăng nhập</label>
                        <input class="form-control disabled-input" [value]="currentUser?.username" disabled>
                        <small class="text-muted" style="font-size: 11px;">* Không thể thay đổi tên đăng nhập</small>
                     </div>
                     <div class="form-group">
                        <label class="form-label">Email</label>
                        <input class="form-control disabled-input" [value]="currentUser?.email" disabled>
                        <small class="text-muted" style="font-size: 11px;">* Email dùng để định danh và khôi phục</small>
                     </div>
                  </div>

                  <div class="form-group mb-4">
                     <label class="form-label">Họ và tên đầy đủ</label>
                     <input class="form-control" [(ngModel)]="profileForm.hoTen" name="hoTen">
                  </div>
                  <div class="form-group mb-4">
                     <label class="form-label">Số điện thoại liên hệ</label>
                     <input 
                        class="form-control" 
                        [(ngModel)]="profileForm.soDienThoai" 
                        name="sdt"
                        (keypress)="onlyNumberKey($event)"
                        maxlength="11"
                        placeholder="Ví dụ: 0987654321">
                  </div>

                  <div *ngIf="currentUser?.vaiTro !== 'Người thuê'" class="banking-box mt-5">
                     <h4 class="text-primary mb-4" style="font-size: 16px; font-weight: 600;"><i class='bx bxs-bank'></i> Tài khoản nhận tiền</h4>
                     <div class="grid-2 gap-4">
                        <div class="form-group">
                           <label class="form-label">Ngân hàng</label>
                           <select class="form-control" [(ngModel)]="profileForm.tenNganHang" name="bank">
                              <option value="">Chọn ngân hàng</option>
                              <option value="MB">MB Bank</option>
                              <option value="VCB">Vietcombank</option>
                              <option value="TCB">Techcombank</option>
                              <option value="ICB">VietinBank</option>
                              <option value="BIDV">BIDV</option>
                              <option value="ACB">ACB</option>
                              <option value="VPB">VPBank</option>
                              <option value="TPB">TPBank</option>
                           </select>
                        </div>
                        <div class="form-group">
                           <label class="form-label">Số tài khoản</label>
                           <input 
                              class="form-control" 
                              [(ngModel)]="profileForm.soTaiKhoan" 
                              name="stk"
                              (keypress)="onlyNumberKey($event)"
                              maxlength="20">
                        </div>
                     </div>
                     <div class="form-group mb-0">
                        <label class="form-label">Chủ tài khoản</label>
                        <input class="form-control uppercase" [(ngModel)]="profileForm.tenTaiKhoan" name="ctk">
                     </div>
                  </div>

                  <div class="text-right mt-5">
                     <button class="btn btn-primary btn-lg" type="submit" [disabled]="loading">Lưu thay đổi</button>
                  </div>
               </form>
            </div>

            <!-- Tab Password -->
            <div *ngIf="activeTab === 'password'" class="fade-in">
               <h3 class="mb-4 pb-3 border-bottom" style="font-size: 18px; color: var(--text-main);">Đổi mật khẩu</h3>
               
               <div *ngIf="passwordStep === 1">
                  <form (ngSubmit)="verifyOldPassword()">
                     <div class="form-group mb-4">
                        <label class="form-label">Mật khẩu hiện tại</label>
                        <input type="password" class="form-control" [(ngModel)]="passwordForm.oldPassword" name="oldPass" required>
                     </div>
                     <button class="btn btn-primary" type="submit">Tiếp tục <i class='bx bx-right-arrow-alt'></i></button>
                  </form>
               </div>

               <div *ngIf="passwordStep === 2">
                  <div class="alert p-3 mb-4" style="background: rgba(14,165,233,0.1); color: var(--info); border-radius: 8px;">
                     <i class='bx bx-info-circle'></i> Mã OTP xác thực đã được gửi đến email <strong>{{ currentUser?.email }}</strong>
                  </div>
                  <form (ngSubmit)="submitNewPassword()">
                     <div class="form-group">
                        <label class="form-label">Mã OTP (6 số)</label>
                        <input class="form-control text-center font-bold text-lg" [(ngModel)]="passwordForm.otpCode" name="otp" maxlength="6" style="letter-spacing: 4px; width: 180px;">
                     </div>
                     <div class="form-group">
                        <label class="form-label">Mật khẩu mới</label>
                        <input type="password" class="form-control" [(ngModel)]="passwordForm.newPassword" name="newPass" required minlength="6">
                     </div>
                     <div class="form-group">
                        <label class="form-label">Nhập lại mật khẩu mới</label>
                        <input type="password" class="form-control" [(ngModel)]="passwordForm.confirmPassword" name="confirmPass" required>
                     </div>
                     <div class="d-flex mt-4 gap-3">
                        <button type="button" class="btn btn-outline" (click)="passwordStep = 1">Quay lại</button>
                        <button class="btn btn-success" type="submit">Đổi mật khẩu</button>
                     </div>
                  </form>
               </div>
            </div>
         </div>
      </div>
    </div>
  `,
  styles: [`
    .profile-layout { display: grid; grid-template-columns: 300px 1fr; gap: 40px; }
    @media(max-width: 768px) { .profile-layout { grid-template-columns: 1fr; } }
    .avatar-lg { width: 100px; height: 100px; background: #6366f1; border-radius: 50%; margin: 0 auto; display: flex; align-items: center; justify-content: center; font-size: 40px; color: white; border: 4px solid var(--bg-body); }
    .menu-stack { display: flex; flex-direction: column; gap: 10px; }
    .btn-menu { text-align: left; padding: 14px 20px; background: transparent; border: 1px solid transparent; color: var(--text-muted); border-radius: 8px; cursor: pointer; transition: 0.2s; display: flex; gap: 10px; align-items: center; font-size: 15px; width: 100%; }
    .btn-menu:hover { background: var(--bg-body); color: var(--text-main); }
    .btn-menu.active { background: rgba(99,102,241,0.1); color: var(--primary); border-color: rgba(99,102,241,0.2); font-weight: 600; }
    
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; }
    .gap-4 { gap: 24px; }
    .disabled-input { background: var(--bg-input); opacity: 0.7; cursor: not-allowed; }
    .banking-box { background: rgba(99,102,241,0.05); padding: 30px; border-radius: 16px; border: 1px dashed var(--border); }
    .uppercase { text-transform: uppercase; }
    .border-bottom { border-bottom: 1px solid var(--border); }
    .fade-in { animation: fadeIn 0.3s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }
  `]
})
export class ProfileComponent implements OnInit {
  currentUser: User | null = null;
  activeTab = 'info';
  loading = false;

  profileForm: any = { hoTen: '', soDienThoai: '', tenNganHang: '', soTaiKhoan: '', tenTaiKhoan: '' };
  
  passwordStep = 1;
  passwordForm = { oldPassword: '', otpCode: '', newPassword: '', confirmPassword: '' };

  constructor(private authService: AuthService) {}

  ngOnInit() {
    this.loadProfile();
  }

  loadProfile() {
    this.authService.getProfile().subscribe(user => {
        this.currentUser = user;
        this.profileForm = {
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
   // 1. Ràng buộc Họ tên không được để trống
   if (!this.profileForm.hoTen || this.profileForm.hoTen.trim().length < 2) {
      alert('Họ tên không được để trống và phải có ít nhất 2 ký tự');
      return;
   }

   // 2. Ràng buộc Số điện thoại (Chỉ chứa số, từ 10-11 chữ số)
   const phoneRegex = /^[0-9]{10,11}$/;
   if (!phoneRegex.test(this.profileForm.soDienThoai)) {
      alert('Số điện thoại không hợp lệ (phải là số và có 10-11 chữ số)');
      return;
   }

   // 3. Ràng buộc Số tài khoản ngân hàng (Nếu có nhập thì phải là số)
   if (this.profileForm.soTaiKhoan) {
      const accRegex = /^[0-9]+$/;
      if (!accRegex.test(this.profileForm.soTaiKhoan)) {
         alert('Số tài khoản ngân hàng chỉ được chứa chữ số');
         return;
      }
   }

   // Nếu vượt qua tất cả kiểm tra thì mới gọi API
   this.loading = true;
   this.authService.updateProfile(this.profileForm).subscribe({
      next: () => {
         this.loading = false;
         alert('Cập nhật thông tin thành công!');
         this.loadProfile(); 
      },
      error: (err) => {
         this.loading = false;
         alert(err.error?.message || 'Lỗi cập nhật');
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
       error: (err) => alert(err.error?.message || 'Mật khẩu cũ không đúng')
     });
   }

  submitNewPassword() {
    if (this.passwordForm.newPassword !== this.passwordForm.confirmPassword) {
      alert('Mật khẩu nhập lại không khớp!');
      return;
    }
    this.authService.confirmChangePassword(this.passwordForm.otpCode, this.passwordForm.newPassword).subscribe({
      next: () => {
        alert('Đổi mật khẩu thành công!');
        this.passwordStep = 1;
        this.passwordForm = { oldPassword: '', otpCode: '', newPassword: '', confirmPassword: '' };
      },
      error: (err) => alert(err.error?.message || 'Mã OTP không đúng')
    });
  }
}