import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationEnd } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { ThemeService } from '../../services/theme.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="sidebar-container">
      <!-- Header -->
      <div class="sidebar-header">
        <a routerLink="/" class="brand">
          <div class="brand-logo"><i class='bx bxs-building-house'></i></div>
          <span class="brand-name">RentHub</span>
        </a>
      </div>

      <!-- Menu -->
      <div class="sidebar-menu" *ngIf="currentUser">
        
        <!-- MENU NGƯỜI THUÊ -->
        <ng-container *ngIf="currentUser.vaiTro === 'Người thuê'">
          <div class="menu-label">CÁ NHÂN</div>
          <a [routerLink]="['/tenant']" [queryParams]="{view: 'overview'}" routerLinkActive="active" 
             [class.active]="currentTenantView === 'overview'" class="menu-item">
            <i class='bx bx-home-smile'></i> <span>Tổng quan</span>
          </a>
          <a [routerLink]="['/tenant']" [queryParams]="{view: 'billing'}" routerLinkActive="active" 
             [class.active]="currentTenantView === 'billing'" class="menu-item">
            <i class='bx bx-receipt'></i> <span>Hóa đơn</span>
          </a>
          <a [routerLink]="['/tenant']" [queryParams]="{view: 'requests'}" routerLinkActive="active" 
             [class.active]="currentTenantView === 'requests'" class="menu-item">
            <i class='bx bx-support'></i> <span>Yêu cầu & Chỉ số</span>
          </a>
          <a [routerLink]="['/tenant']" [queryParams]="{view: 'notifications'}" routerLinkActive="active" 
             [class.active]="currentTenantView === 'notifications'" class="menu-item">
            <i class='bx bx-bell'></i> <span>Thông báo</span>
          </a>
        </ng-container>

        <!-- MENU CHỦ TRỌ -->
        <ng-container *ngIf="currentUser.vaiTro !== 'Người thuê'">
          <div class="menu-label">QUẢN LÝ CHÍNH</div>
          
          <a routerLink="/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{ exact: true }" class="menu-item">
            <i class='bx bxs-dashboard'></i> <span>Dashboard</span>
          </a>
          <a routerLink="/day-tro" routerLinkActive="active" class="menu-item">
            <i class='bx bx-buildings'></i> <span>Dãy trọ</span>
          </a>
          <a routerLink="/phong-tro" routerLinkActive="active" class="menu-item">
            <i class='bx bx-door-open'></i> <span>Phòng trọ</span>
          </a>
          <a routerLink="/khach-thue" routerLinkActive="active" class="menu-item">
            <i class='bx bx-user'></i> <span>Khách thuê</span>
          </a>
          <a routerLink="/hop-dong" routerLinkActive="active" class="menu-item">
            <i class='bx bx-file'></i> <span>Hợp đồng</span>
          </a>
          <a routerLink="/hoa-don" routerLinkActive="active" class="menu-item">
            <i class='bx bx-receipt'></i> <span>Hóa đơn</span>
          </a>

          <div class="menu-label mt-4">TIỆN ÍCH & CẤU HÌNH</div>
          <a routerLink="/chi-so-cong-to" routerLinkActive="active" class="menu-item">
            <i class='bx bx-tachometer'></i> <span>Chỉ số điện/nước</span>
          </a>
          <a routerLink="/dich-vu" routerLinkActive="active" class="menu-item">
            <i class='bx bx-list-ul'></i> <span>Dịch vụ</span>
          </a>
          <a routerLink="/bieu-mau" routerLinkActive="active" class="menu-item">
            <i class='bx bx-printer'></i> <span>Biểu mẫu in ấn</span>
          </a>
          <a routerLink="/yeu-cau" routerLinkActive="active" class="menu-item">
            <i class='bx bx-error-circle'></i> <span>Yêu cầu & Sự cố</span>
          </a>
          <a routerLink="/thong-bao" routerLinkActive="active" class="menu-item">
            <i class='bx bx-bell'></i> <span>Thông báo</span>
          </a>
        </ng-container>
      </div>

      <!-- Footer User + Theme Toggle -->
      <div class="sidebar-footer" *ngIf="currentUser">
        <div class="theme-toggle mb-3">
             <div class="theme-switch" (click)="toggleTheme()">
                 <div class="option" [class.active]="!(isDarkMode$ | async)">
                    <i class='bx bx-sun'></i> Sáng
                 </div>
                 <div class="option" [class.active]="(isDarkMode$ | async)">
                    <i class='bx bx-moon'></i> Tối
                 </div>
             </div>
        </div>

        <div class="user-row">
            <a routerLink="/profile" class="user-info">
              <div class="avatar">{{ currentUser.hoTen?.charAt(0) }}</div>
              <div class="meta">
                <div class="name">{{ currentUser.hoTen }}</div>
                <div class="role">{{ currentUser.vaiTro }}</div>
              </div>
            </a>
            <button class="logout-btn" (click)="logout()" title="Đăng xuất"><i class='bx bx-log-out'></i></button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .sidebar-container { display: flex; flex-direction: column; height: 100%; padding: 24px 16px; background: var(--bg-sidebar); border-right: 1px solid var(--border); transition: background-color 0.3s; }
    .sidebar-header { margin-bottom: 32px; padding: 0 8px; }
    .brand { display: flex; align-items: center; gap: 12px; text-decoration: none; color: var(--text-main); }
    .brand-logo { width: 40px; height: 40px; background: linear-gradient(135deg, #6366f1, #8b5cf6); border-radius: 10px; display: flex; align-items: center; justify-content: center; font-size: 24px; color: white; box-shadow: 0 0 15px rgba(99,102,241,0.5); }
    .brand-name { font-weight: 700; font-size: 18px; letter-spacing: -0.5px; }

    .sidebar-menu { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 4px; }
    .menu-label { font-size: 11px; font-weight: 700; color: var(--text-muted); margin: 12px 0 4px 12px; letter-spacing: 0.5px; }
    
    .menu-item { display: flex; align-items: center; gap: 10px; padding: 15px; color: var(--text-muted); text-decoration: none; border-radius: 8px; transition: all 0.2s; font-size: 14px; font-weight: 500; }
    .menu-item i { font-size: 20px; min-width: 24px; }
    .menu-item:hover { background: var(--bg-input); color: var(--primary); transform: translateX(4px); }
    .menu-item.active { background: var(--primary); color: white; box-shadow: 0 4px 12px rgba(99,102,241,0.3); font-weight: 600; }
    
    .sidebar-footer { border-top: 1px solid var(--border); padding-top: 16px; margin-top: 16px; }
    
    .theme-switch { display: flex; background: var(--bg-input); padding: 4px; border-radius: 8px; cursor: pointer; width: 100%; border: 1px solid var(--border); }
    .option { flex: 1; display: flex; align-items: center; justify-content: center; gap: 6px; padding: 6px; font-size: 12px; color: var(--text-muted); border-radius: 6px; transition: 0.2s; }
    .option.active { background: var(--bg-card); color: var(--text-main); font-weight: 600; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
    .option.active i { color: var(--primary); }

    .user-row { display: flex; align-items: center; justify-content: space-between; margin-top: 12px; }
    .user-info { display: flex; align-items: center; gap: 10px; text-decoration: none; flex: 1; }
    .avatar { width: 40px; height: 40px; background: var(--bg-input); border-radius: 50%; color: var(--text-main); display: flex; align-items: center; justify-content: center; font-weight: 700; border: 1px solid var(--border); }
    .meta { line-height: 1.3; }
    .name { color: var(--text-main); font-size: 13px; font-weight: 600; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 110px; }
    .role { color: var(--text-muted); font-size: 11px; }
    .logout-btn { background: rgba(239,68,68,0.1); border: none; color: #ef4444; font-size: 20px; cursor: pointer; padding: 8px; border-radius: 8px; transition: 0.2s; }
    .logout-btn:hover { background: #ef4444; color: white; }
    .mt-4 { margin-top: 24px; } .mb-3 { margin-bottom: 12px; }
  `]
})
export class NavbarComponent {
  currentUser: any = null;
  currentTenantView = 'overview';
  isDarkMode$ = this.themeService.isDarkMode$;

  constructor(
    private authService: AuthService, 
    private router: Router,
    private themeService: ThemeService
  ) {
    this.authService.currentUser$.subscribe(user => this.currentUser = user);
    
    this.router.events.pipe(filter(e => e instanceof NavigationEnd)).subscribe(() => {
        const url = this.router.url;
        if(url.includes('view=billing')) this.currentTenantView = 'billing';
        else if(url.includes('view=requests')) this.currentTenantView = 'requests';
        else if(url.includes('view=notifications')) this.currentTenantView = 'notifications';
        else this.currentTenantView = 'overview';
    });
  }

  get homeLink() { 
    return this.currentUser?.vaiTro === 'Người thuê' ? '/tenant' : '/dashboard'; 
  }

  logout() { 
    this.authService.logout(); this.router.navigate(['/login']); 
  }

  toggleTheme() { 
    this.themeService.toggleTheme(); 
  }
}