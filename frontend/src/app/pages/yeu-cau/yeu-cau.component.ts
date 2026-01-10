import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, YeuCauChinhSua, ChiSoCongToGuiTuThue } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-yeu-cau',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './yeu-cau.component.html',
  styleUrls: ['./yeu-cau.component.css']
})
export class YeuCauComponent implements OnInit {
  activeTab = 'requests';
  yeuCaus: any[] = [];
  meters: any[] = [];
  phongTroMap: any = {};
  khachThueMap: any = {};
  showRequestModal = false;
  selectedRequest: any;
  requestResponse = { phanHoi: '', trangThai: 'Đang xử lý' };
  showMeterModal = false;
  selectedMeter: any;
  meterConfirmData = { chiSoCu: 0, soTieuThu: 0 };

  constructor(private apiService: ApiService, private toastService: ToastService) { }
  ngOnInit() {
    this.loadMetadata();
    this.loadData();
  }

  loadMetadata() {
    this.apiService.getPhongTros().subscribe(
      d => d.forEach(
        p => this.phongTroMap[p.id] = p.soPhong
      )
    );
    this.apiService.getKhachThues().subscribe(
      d => d.forEach(
        k => this.khachThueMap[k.id] = k.hoTen
      )
    );
  }

  loadData() {
    this.apiService.getAllYeuCaus().subscribe(
      d => this.yeuCaus = d
    );
    this.apiService.getAllSubmittedMeterReadings().subscribe(
      d => this.meters = d
    );
  }

  get pendingRequestsCount() {
    return this.yeuCaus.filter(x => x.trangThai === 'Chờ xử lý').length;
  }

  get pendingMetersCount() {
    return this.meters.filter(x => x.trangThai === 'Chờ xác nhận').length;
  }

  getTenPhong(id: number) {
    return this.phongTroMap[id] || id;
  }

  getTenKhach(id: number) {
    return this.khachThueMap[id] || id;
  }

  getStatusClass(s: string) {
    return s === 'Chờ xử lý' ? 'badge-warning' : (s === 'Hoàn thành' ? 'badge-success' : 'badge-info');
  }

  openRequestModal(i: any) {
    this.selectedRequest = i; this.showRequestModal = true;
  }

  closeRequestModal(e: any) {
    if (!e || e.target === e.currentTarget) this.showRequestModal = false;
  }

  submitRequestResponse() {
    this.apiService.respondToYeuCau(this.selectedRequest.id, this.requestResponse).subscribe({
      next: () => {
        this.toastService.success('Đã gửi phản hồi thành công!');
        this.showRequestModal = false;
        this.loadData();
      },
      error: () => this.toastService.error('Lỗi khi gửi phản hồi')
    });
  }
  openMeterConfirmModal(i: any) {
    this.selectedMeter = i; this.showMeterModal = true;
    if (i.phongTroId && i.loaiCongTo) this.apiService.getGoiYChiSo(i.phongTroId, i.loaiCongTo).subscribe(r => this.meterConfirmData = { chiSoCu: r.chiSoCu || 0, soTieuThu: i.chiSo - (r.chiSoCu || 0) });
  }
  closeMeterModal(e: any) {
    if (!e || e.target === e.currentTarget) this.showMeterModal = false;
  }

  calculateUsage() {
    if (this.selectedMeter) this.meterConfirmData.soTieuThu = this.selectedMeter.chiSo - this.meterConfirmData.chiSoCu;
  }

  confirmMeter() {
    this.apiService.confirmMeterReading(this.selectedMeter.id, this.meterConfirmData.chiSoCu).subscribe({
      next: () => {
        this.toastService.success('Đã duyệt chỉ số và tạo hóa đơn (nếu có)!');
        this.showMeterModal = false;
        this.loadData();
      },
      error: (err) => this.toastService.error(err.error?.message || 'Lỗi khi duyệt chỉ số')
    });
  }

  rejectMeter() {
    const r = prompt('Nhập lý do từ chối:');
    if (r) {
      this.apiService.rejectMeterReading(this.selectedMeter.id, r).subscribe({
        next: () => {
          this.toastService.success('Đã từ chối chỉ số!');
          this.showMeterModal = false;
          this.loadData();
        },
        error: () => this.toastService.error('Lỗi khi từ chối')
      });
    }
  }

  quickRejectMeter(item: any) {
    const lyDo = prompt('Nhập lý do từ chối chỉ số này:');
    if (lyDo !== null) {
      this.apiService.rejectMeterReading(item.id, lyDo || 'Thông tin chỉ số không chính xác').subscribe({
        next: () => {
          alert(' Đã từ chối chỉ số thành công.');
          this.loadData();
        },
        error: (err) => alert('Lỗi: ' + (err.error?.message || 'Không thể thực hiện'))
      });
    }
  }

  deleteMeter(id: number) {
    if (confirm('Xác nhận xóa phiếu gửi chỉ số này?')) {
      this.apiService.deleteMeterReading(id).subscribe({
        next: () => {
          this.toastService.success('Đã xóa phiếu gửi thành công');
          this.loadData();
        },
        error: (err) => this.toastService.error('Lỗi khi xóa')
      });
    }
  }

  deleteYeuCau(id: number) {
    if (confirm('Xác nhận xóa vĩnh viễn yêu cầu này?')) {
      this.apiService.deleteYeuCau(id).subscribe({
        next: () => {
          this.toastService.success('Đã xóa yêu cầu thành công');
          this.loadData();
        },
        error: (err) => this.toastService.error('Lỗi: ' + err.error?.message)
      });
    }
  }
}