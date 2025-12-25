import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, ThongKe, DoanhThuThang } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { forkJoin } from 'rxjs'; 
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container-fluid">
      <div class="page-header">
        <h1><i class='bx bxs-dashboard text-gradient'></i> Tổng Quan Hoạt Động</h1>
        <button class="btn btn-secondary" (click)="refreshData()" [disabled]="isLoading">
            <i class='bx' [ngClass]="isLoading ? 'bx-loader-alt bx-spin' : 'bx-refresh'"></i>
            {{ isLoading ? 'Đang tải...' : 'Cập nhật dữ liệu' }}
        </button>
      </div>

      <!-- Stats Grid -->
      <div class="stats-grid">
        <div class="stat-card">
           <div class="icon-box blue"><i class='bx bx-home'></i></div>
           <div><div class="label">Tổng số phòng</div><div class="val">{{ thongKe?.tongSoPhong || 0 }}</div></div>
        </div>
        <div class="stat-card">
           <div class="icon-box green"><i class='bx bx-check-circle'></i></div>
           <div><div class="label">Phòng trống</div><div class="val">{{ thongKe?.phongTrong || 0 }}</div></div>
        </div>
        <div class="stat-card">
           <div class="icon-box purple"><i class='bx bx-user-check'></i></div>
           <div><div class="label">Đã cho thuê</div><div class="val">{{ thongKe?.phongDaThue || 0 }}</div></div>
        </div>
        <div class="stat-card">
           <div class="icon-box orange"><i class='bx bx-coin-stack'></i></div>
           <div><div class="label">Doanh thu tháng</div><div class="val">{{ (thongKe?.doanhThuThang || 0) | number }} đ</div></div>
        </div>
        <div class="stat-card">
           <div class="icon-box red"><i class='bx bx-error-circle'></i></div>
           <div><div class="label">Chưa thanh toán</div><div class="val">{{ thongKe?.hoaDonChuaThanhToan || 0 }}</div></div>
        </div>
      </div>

      <!-- Main Content -->
      <div class="dashboard-grid">
         <!-- Chart -->
         <div class="card chart-card">
            <h3 class="card-title"><i class='bx bx-bar-chart-alt-2'></i> Doanh thu 12 tháng gần nhất</h3>
            
            <div *ngIf="isLoading" class="loading-overlay">
                <i class='bx bx-loader-alt bx-spin'></i> Đang tải biểu đồ...
            </div>

            <div class="chart-wrapper" *ngIf="!isLoading">
               <div class="bar-group" *ngFor="let item of doanhThu12Thang">
                  <div class="tooltip">{{ (item.doanhThu / 1000000) | number:'1.1-1' }}M</div>
                  <div class="bar" [style.height.%]="getBarHeight(item.doanhThu)"></div>
                  <div class="bar-label">T{{ item.thang }}</div>
               </div>
               <div *ngIf="doanhThu12Thang.length === 0" class="text-muted text-center w-100">Chưa có dữ liệu doanh thu</div>
            </div>
         </div>

         <!-- Contracts Warning -->
         <div class="card warning-card">
            <h3 class="card-title text-warning"><i class='bx bx-time-five'></i> Hợp đồng sắp hết hạn</h3>
            <div class="contract-list">
               <div class="contract-item" *ngFor="let c of expiringContracts">
                  <div class="info">
                     <div class="room-name">{{c.tenPhong}}</div>
                     <div class="tenant-name">{{c.tenKhach}}</div>
                  </div>
                  <span class="days-badge">{{c.soNgayConLai}} ngày</span>
               </div>
               <div *ngIf="expiringContracts.length === 0 && !isLoading" class="empty-state">
                  <i class='bx bx-check-shield'></i>
                  <p>Không có hợp đồng nào sắp hết hạn</p>
               </div>
            </div>
         </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 24px; margin-bottom: 30px; }
    .stat-card { background: var(--bg-card); border: 1px solid var(--border); border-radius: 12px; padding: 24px; display: flex; align-items: center; gap: 16px; }
    
    .icon-box { width: 52px; height: 52px; border-radius: 14px; display: flex; align-items: center; justify-content: center; font-size: 26px; flex-shrink: 0; }
    .blue { background: rgba(99,102,241,0.1); color: #6366f1; }
    .green { background: rgba(16,185,129,0.1); color: #10b981; }
    .purple { background: rgba(168,85,247,0.1); color: #a855f7; }
    .orange { background: rgba(245,158,11,0.1); color: #fbbf24; }
    .red { background: rgba(239,68,68,0.1); color: #f87171; }

    .val { font-size: 22px; font-weight: 700; color: var(--text-main); margin-top: 2px; }
    .label { font-size: 13px; color: var(--text-muted); }

    .dashboard-grid { display: grid; grid-template-columns: 3fr 1.2fr; gap: 24px; }
    @media(max-width: 1200px) { .dashboard-grid { grid-template-columns: 1fr; } }

    .chart-card, .warning-card { height: 100%; min-height: 450px; display: flex; flex-direction: column; }
    .card-title { font-size: 16px; font-weight: 600; margin: 0 0 24px 0; color: var(--text-main); display: flex; align-items: center; gap: 10px; border-bottom: 1px solid var(--border); padding-bottom: 16px; }

    .chart-wrapper { flex: 1; display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; height: 320px; padding: 20px 10px 0; }
    .bar-group { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: flex-end; height: 100%; position: relative; }
    .bar { width: 100%; max-width: 40px; min-width: 10px; background: linear-gradient(to top, #6366f1, #818cf8); border-radius: 6px 6px 0 0; min-height: 4px; opacity: 0.8; transition: height 0.5s ease-out; }
    .bar:hover { opacity: 1; transform: scaleY(1.02); box-shadow: 0 0 15px rgba(99,102,241,0.4); }
    .bar-label { margin-top: 10px; font-size: 12px; color: var(--text-muted); }
    .tooltip { position: absolute; top: -35px; background: #334155; color: white; font-size: 11px; padding: 4px 8px; border-radius: 6px; opacity: 0; transition: 0.2s; pointer-events: none; white-space: nowrap; }
    .bar-group:hover .tooltip { opacity: 1; top: -45px; }

    .contract-list { flex: 1; display: flex; flex-direction: column; gap: 12px; overflow-y: auto; }
    .contract-item { background: var(--bg-body); padding: 14px; border-radius: 10px; display: flex; justify-content: space-between; align-items: center; border: 1px solid var(--border); }
    .room-name { font-weight: 600; color: var(--text-main); font-size: 14px; }
    .tenant-name { font-size: 12px; color: var(--text-muted); }
    .days-badge { background: rgba(245,158,11,0.15); color: #fbbf24; padding: 6px 10px; border-radius: 6px; font-weight: 600; font-size: 12px; }
    
    .empty-state { text-align: center; color: var(--text-muted); padding: 40px 0; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100%; }
    .empty-state i { font-size: 40px; margin-bottom: 10px; opacity: 0.5; }
    
    .loading-overlay { display: flex; align-items: center; justify-content: center; height: 300px; color: var(--text-muted); gap: 10px; font-size: 16px; }
  `]
})
export class DashboardComponent implements OnInit {
  thongKe: ThongKe | null = null;
  doanhThu12Thang: DoanhThuThang[] = [];
  expiringContracts: any[] = [];
  isLoading = false;

  constructor(private apiService: ApiService, private authService: AuthService, private router: Router) {}

  ngOnInit() {
    if (this.authService.getCurrentUser()?.vaiTro === 'Người thuê') {
      this.router.navigate(['/tenant']);
      return;
    }
    this.refreshData();
  }

  refreshData() {
    this.isLoading = true;
    forkJoin({
      thongKe: this.apiService.getThongKe(),
      doanhThu: this.apiService.getDoanhThu12Thang(),
      hopDong: this.apiService.getHopDongSapHetHan()
    }).pipe(finalize(() => this.isLoading = false)).subscribe({
      next: (res) => {
        this.thongKe = res.thongKe;
        this.doanhThu12Thang = res.doanhThu;
        this.expiringContracts = res.hopDong;
      },
      error: (err) => {
        console.error('Lỗi tải dữ liệu Dashboard', err);
      }
    });
  }

  getBarHeight(value: number): number {
    if (!this.doanhThu12Thang.length) return 0;
    const maxValue = Math.max(...this.doanhThu12Thang.map(d => d.doanhThu));
    return maxValue === 0 ? 0 : (value / maxValue) * 100;
  }
}