import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, DayTro } from '../../services/api.service';

@Component({
  selector: 'app-day-tro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="page-header">
        <h1><i class='bx bx-buildings text-gradient'></i> Quản lý Dãy Trọ</h1>
        <button class="btn btn-primary" (click)="openModal()">
            <i class='bx bx-plus-circle'></i> Thêm dãy mới
        </button>
      </div>

      <div class="card p-0">
        <div class="table-wrapper">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Tên Dãy Trọ</th>
                <th>Địa Chỉ</th>
                <th>Quy Mô</th>
                <th>Tổng Phòng</th>
                <th class="text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let day of dayTros">
                <td>
                    <div style="font-weight: 600; font-size: 15px; color: var(--text-main);">{{ day.tenDayTro }}</div>
                    <div class="text-muted" style="font-size: 12px;">Ngày tạo: {{ day.ngayTao | date:'dd/MM/yyyy' }}</div>
                </td>
                <td>
                    <div class="d-flex"><i class='bx bx-map' style="color: var(--text-muted); font-size: 18px;"></i> {{ day.diaChi }}</div>
                </td>
                <td>
                    <div>{{ day.soTang }} tầng</div>
                    <div class="text-muted" style="font-size: 12px;">{{ day.soPhongMoiTang }} phòng/tầng</div>
                </td>
                <td>
                    <span class="badge badge-info">{{ day.tongSoPhong }} phòng</span>
                </td>
                <td class="text-right">
                  <button class="btn-icon-action edit" (click)="editDay(day)" title="Sửa"><i class='bx bx-edit-alt'></i></button>
                  <button class="btn-icon-action delete" (click)="deleteDay(day.id)" title="Xóa"><i class='bx bx-trash'></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div class="modal" *ngIf="showModal" (click)="closeModal($event)">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEdit ? 'Cập nhật Dãy Trọ' : 'Thêm Dãy Trọ Mới' }}</h3>
          <button class="close-btn" (click)="closeModal()"><i class='bx bx-x'></i></button>
        </div>
        <form (ngSubmit)="saveDay()">
          <div class="form-group">
            <label class="form-label">Tên Dãy Trọ <span class="text-danger">*</span></label>
            <input type="text" class="form-control" [(ngModel)]="formData.tenDayTro" name="tenDayTro" required placeholder="Ví dụ: Dãy A - Luxury">
          </div>
          <div class="form-group">
            <label class="form-label">Địa Chỉ <span class="text-danger">*</span></label>
            <input type="text" class="form-control" [(ngModel)]="formData.diaChi" name="diaChi" required placeholder="Nhập địa chỉ chi tiết...">
          </div>
          <div class="d-flex gap-3">
              <div class="form-group w-100">
                <label class="form-label">Số Tầng <span class="text-danger">*</span></label>
                <input type="number" class="form-control" [(ngModel)]="formData.soTang" name="soTang" required min="1">
              </div>
              <div class="form-group w-100">
                <label class="form-label">Phòng/Tầng <span class="text-danger">*</span></label>
                <input type="number" class="form-control" [(ngModel)]="formData.soPhongMoiTang" name="soPhongMoiTang" required min="1">
              </div>
          </div>
          <div class="form-group">
            <label class="form-label">Mô Tả</label>
            <textarea class="form-control" rows="3" [(ngModel)]="formData.moTa" name="moTa" placeholder="Ghi chú thêm..."></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Hủy</button>
            <button type="submit" class="btn btn-primary"><i class='bx bx-save'></i> Lưu lại</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class DayTroComponent implements OnInit {
  dayTros: DayTro[] = [];
  showModal = false;
  isEdit = false;
  formData: any = { tenDayTro: '', diaChi: '', soTang: 1, soPhongMoiTang: 1, moTa: '' };
  editingId: number | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() { this.loadDayTros(); }

  loadDayTros() {
    this.apiService.getDayTros().subscribe({
      next: (data) => this.dayTros = data,
      error: (err) => alert('Lỗi tải dữ liệu')
    });
  }

  openModal() {
    this.isEdit = false;
    this.formData = { tenDayTro: '', diaChi: '', soTang: 1, soPhongMoiTang: 1, moTa: '' };
    this.editingId = null;
    this.showModal = true;
  }

  editDay(day: DayTro) {
    this.isEdit = true;
    this.editingId = day.id;
    this.formData = { ...day };
    this.showModal = true;
  }

  closeModal(event?: any) {
    if (!event || event.target === event.currentTarget) {
      this.showModal = false;
    }
  }

  saveDay() {
    const request = this.isEdit 
        ? this.apiService.updateDayTro(this.editingId!, this.formData) 
        : this.apiService.createDayTro(this.formData);
        
    request.subscribe({
        next: () => { this.loadDayTros(); this.closeModal(); },
        error: () => alert('Có lỗi xảy ra')
    });
  }

  deleteDay(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa dãy trọ này?')) {
      this.apiService.deleteDayTro(id).subscribe({
        next: () => this.loadDayTros(),
        error: () => alert('Lỗi khi xóa')
      });
    }
  }
}