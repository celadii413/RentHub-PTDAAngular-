import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-intro',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="landing-page">
      <!-- Navbar -->
      <header class="landing-header">
        <div class="container d-flex justify-between align-items-center">
           <div class="logo">
              <i class='bx bxs-building-house text-primary'></i> 
              <span>RoomManager</span>
           </div>

           <div class="nav-actions d-flex">
              <ng-container *ngIf="!isLoggedIn">
                  <a routerLink="/login" class="btn btn-outline">Đăng nhập</a>
                  <a routerLink="/register" class="btn btn-primary">Dùng thử miễn phí</a>
              </ng-container>

              <ng-container *ngIf="isLoggedIn">
                  <span class="welcome-text d-none d-md-block">Xin chào, {{ userName }}</span>
                  <button (click)="goToDashboard()" class="btn btn-primary">
                      <i class='bx bxs-dashboard'></i> Vào Dashboard
                  </button>
              </ng-container>
           </div>
        </div>
      </header>

      <section class="hero-section">
         <div class="container text-center">
            <h1 class="hero-title">
               Quản lý nhà trọ <span class="text-gradient">thông minh</span> & <span class="text-gradient">hiệu quả</span>
            </h1>
            <p class="hero-desc">
               Giải pháp toàn diện giúp chủ trọ quản lý phòng, điện nước, hợp đồng và hóa đơn 
               một cách dễ dàng. Tự động hóa quy trình, tiết kiệm thời gian.
            </p>

            <div class="hero-btns">
               <ng-container *ngIf="!isLoggedIn">
                   <a routerLink="/register" class="btn btn-lg btn-primary">
                      <i class='bx bx-rocket'></i> Bắt đầu ngay
                   </a>
                   <a routerLink="/login" class="btn btn-lg btn-secondary">
                      <i class='bx bx-user'></i> Tôi là người thuê
                   </a>
               </ng-container>
               
               <ng-container *ngIf="isLoggedIn">
                   <button (click)="goToDashboard()" class="btn btn-lg btn-primary">
                      <i class='bx bx-rocket'></i> Tiếp tục quản lý
                   </button>
               </ng-container>
            </div>
         </div>
      </section>

      <section class="features-section">
         <div class="container">
            <div class="feature-grid">
               <div class="feature-card">
                  <div class="icon-wrapper blue"><i class='bx bx-home'></i></div>
                  <h3>Quản lý Phòng & Khách</h3>
                  <p>Theo dõi tình trạng phòng, thông tin khách thuê và lịch sử lưu trú chi tiết, trực quan.</p>
               </div>
               <div class="feature-card green"><div class="icon-wrapper green"><i class='bx bx-receipt'></i></div><h3>Hóa đơn Tự động</h3><p>Chốt điện nước và tính tiền tự động hàng tháng. Gửi hóa đơn qua Email/App nhanh chóng.</p></div>
               <div class="feature-card purple"><div class="icon-wrapper purple"><i class='bx bx-support'></i></div><h3>Tương tác Khách thuê</h3><p>Khách thuê có thể báo cáo sự cố, xem hóa đơn và thanh toán online qua QR Code tiện lợi.</p></div>
            </div>
         </div>
      </section>

      <footer class="landing-footer text-center">
         <p>© 2025 RoomManager Pro. All rights reserved.</p>
      </footer>
    </div>
  `,
  styles: [`
    .landing-page { 
        min-height: 100vh; 
        background-color: var(--bg-body); 
        color: var(--text-main); 
        font-family: 'Inter', sans-serif; 
        transition: 0.3s; 
    }
    .landing-header { padding: 20px 0; border-bottom: 1px solid var(--border); width: 100%; }
    .logo { font-size: 22px; font-weight: 700; display: flex; align-items: center; gap: 10px; color: var(--text-main); }
    .text-primary { color: var(--primary); }
    .hero-section { padding: 100px 0 80px; }
    .hero-title { 
        font-size: 56px; font-weight: 800; margin-bottom: 24px; line-height: 1.2; 
        color: var(--text-main); 
    }
    .text-gradient { background: linear-gradient(to right, #6366f1, #a855f7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .hero-desc { font-size: 18px; color: var(--text-muted); max-width: 700px; margin: 0 auto 40px; }
    .hero-btns { display: flex; justify-content: center; gap: 20px; }
    .btn-lg { padding: 14px 32px; font-size: 16px; border-radius: 8px; }
    .welcome-text { font-weight: 600; color: var(--text-main); margin-right: 10px; font-size: 14px; }

    .features-section { padding: 60px 0; }
    .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px; }
    .feature-card { background: var(--bg-card); padding: 40px; border-radius: 20px; border: 1px solid var(--border); transition: transform 0.3s; }
    .feature-card:hover { transform: translateY(-10px); border-color: var(--primary); }
    
    .icon-wrapper { width: 64px; height: 64px; border-radius: 16px; display: flex; align-items: center; justify-content: center; font-size: 32px; margin-bottom: 24px; }
    .icon-wrapper.blue { background: rgba(99,102,241,0.1); color: #6366f1; }
    .icon-wrapper.green { background: rgba(16,185,129,0.1); color: #10b981; }
    .icon-wrapper.purple { background: rgba(168,85,247,0.1); color: #a855f7; }
    
    .feature-card h3 { 
        font-size: 20px; font-weight: 700; margin-bottom: 12px; 
        color: var(--text-main); 
    }
    .feature-card p { color: var(--text-muted); line-height: 1.6; font-size: 15px; margin: 0; }

    .landing-footer { padding: 40px; border-top: 1px solid var(--border); margin-top: 40px; color: var(--text-muted); font-size: 13px; }
    
    @media(max-width: 768px) { .d-none.d-md-block { display: none; } }
  `]
})
export class IntroComponent implements OnInit {
  isLoggedIn = false;
  userName = '';
  userRole = '';

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit() {
    this.isLoggedIn = this.authService.isAuthenticated();
    const user = this.authService.getCurrentUser();
    if (user) {
        this.userName = user.hoTen || user.username;
        this.userRole = user.vaiTro;
    }
  }

  goToDashboard() {
    if (this.userRole === 'Người thuê') {
        this.router.navigate(['/tenant']);
    } else {
        this.router.navigate(['/dashboard']);
    }
  }
}