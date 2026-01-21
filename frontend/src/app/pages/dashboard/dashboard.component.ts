import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ApiService, ThongKe, DoanhThuThang } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { forkJoin } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {
  thongKe: ThongKe | null = null;
  doanhThu12Thang: DoanhThuThang[] = [];
  expiringContracts: any[] = [];
  isLoading = false;
  tongDien: number = 0;
  tongNuoc: number = 0;

  constructor(private apiService: ApiService, private authService: AuthService, private router: Router, private toastService: ToastService) { }

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
      hopDong: this.apiService.getHopDongSapHetHan(),
      tieuThu: this.apiService.getTongTieuThuThang()
    }).pipe(finalize(() => this.isLoading = false)).subscribe({
      next: (res) => {
        this.thongKe = res.thongKe;
        this.doanhThu12Thang = res.doanhThu;
        this.expiringContracts = res.hopDong;
        this.tongDien = res.tieuThu.dien; 
        this.tongNuoc = res.tieuThu.nuoc;
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