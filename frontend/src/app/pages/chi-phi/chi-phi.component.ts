import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, DayTro, ChiPhi } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-chi-phi',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="page-header">
        <h1><i class='bx bx-wallet text-gradient'></i> Quản lý Chi Tiêu</h1>
        <button class="btn btn-primary" (click)="openModal()"><i class='bx bx-plus-circle'></i> Thêm khoản chi</button>
      </div>

      <div class="card p-0">
        <div class="table-wrapper">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Tên khoản chi</th>
                <th>Số tiền</th>
                <th>Loại</th>
                <th>Dãy áp dụng</th>
                <th>Ngày chi</th>
                <th class="text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of chiPhis">
                <td>
                    <div class="text-main" style="font-weight: 600;">{{item.tenChiPhi}}</div>
                    <small class="text-muted">{{item.ghiChu}}</small>
                </td>
                <td class="text-danger-bold">-{{item.soTien | number}} đ</td>
                <td><span class="badge badge-secondary">{{item.loaiChiPhi}}</span></td>
                <td>{{item.tenDayTro}}</td>
                <td>{{item.ngayChi | date:'dd/MM/yyyy'}}</td>
                <td class="text-right">
                  <button class="btn-icon-action edit" (click)="editChiPhi(item)" style="margin-right: 8px;">
                    <i class='bx bx-edit-alt'></i>
                  </button>
                  <button class="btn-icon-action delete" (click)="deleteChiPhi(item.id)">
                    <i class='bx bx-trash'></i>
                  </button>
                </td>
              </tr>
              <tr *ngIf="chiPhis.length === 0">
                  <td colspan="6" class="text-center p-4 text-muted">Chưa có khoản chi nào.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <div class="modal" *ngIf="showModal" (click)="closeModal($event)">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
            <h3 class="modal-title">{{ isEdit ? 'Sửa Khoản Chi' : 'Thêm Khoản Chi' }}</h3>
            <button class="close-btn" (click)="closeModal()">&times;</button>
        </div>
        <form (ngSubmit)="saveChiPhi()">
          <div class="form-group">
            <label class="form-label">Tên khoản chi *</label>
            <input class="form-control" [(ngModel)]="formData.tenChiPhi" name="ten" required placeholder="Nhập tên khoản chi...">
          </div>
          <div class="d-flex gap-3">
             <div style="flex: 1;">
                <label class="form-label">Số tiền *</label>
                <input type="number" class="form-control" [(ngModel)]="formData.soTien" name="tien" required>
             </div>
             <div style="flex: 1;">
                <label class="form-label">Loại chi phí</label>
                <select class="form-control" [(ngModel)]="formData.loaiChiPhi" name="loai">
                    <option value="Sửa chữa">Sửa chữa</option>
                    <option value="Điện lực">Tiền điện</option>
                    <option value="Nước">Tiền nước</option>
                    <option value="Internet">Internet</option>
                    <option value="Đầu tư">Đầu tư</option>
                    <option value="Khác">Khác</option>
                </select>
             </div>
          </div>
          <div class="form-group mt-3">
            <label class="form-label">Chi cho dãy nào?</label>
            <select class="form-control" [(ngModel)]="formData.dayTroId" name="day">
                <option [ngValue]="null">-- Chi chung (Tất cả) --</option>
                <option *ngFor="let d of dayTros" [ngValue]="d.id">{{d.tenDayTro}}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Ngày chi</label>
            <input type="date" class="form-control" [(ngModel)]="formData.ngayChi" name="ngay" required>
          </div>
          <div class="form-group">
            <label class="form-label">Ghi chú</label>
            <textarea class="form-control" [(ngModel)]="formData.ghiChu" name="gc" rows="2"></textarea>
          </div>
          <div class="modal-footer">
             <button type="button" class="btn btn-secondary" (click)="closeModal()">Hủy</button>
             <button type="submit" class="btn btn-primary">Lưu khoản chi</button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ChiPhiComponent implements OnInit {
  chiPhis: ChiPhi[] = [];
  dayTros: DayTro[] = [];
  showModal = false;
  isEdit = false;
  editingId: number | null = null;
  formData: any = {};

  constructor(private api: ApiService, private toast: ToastService) { }

  ngOnInit() {
    this.loadData();
    this.api.getDayTros().subscribe(res => this.dayTros = res);
  }

  loadData() {
    this.api.getChiPhis().subscribe(res => this.chiPhis = res);
  }

  openModal() {
    this.formData = { tenChiPhi: '', soTien: 0, loaiChiPhi: 'Khác', dayTroId: null, ngayChi: new Date().toISOString().split('T')[0], ghiChu: '' };
    this.showModal = true;
  }

  closeModal(e?: any) { if (!e || e.target === e.currentTarget) this.showModal = false; }

  editChiPhi(item: any) {
    this.isEdit = true;
    this.editingId = item.id;
    this.formData = { ...item, ngayChi: item.ngayChi.split('T')[0] };
    this.showModal = true;
  }

  saveChiPhi() {
    const request = this.isEdit
      ? this.api.updateChiPhi(this.editingId!, this.formData)
      : this.api.createChiPhi(this.formData);

    request.subscribe({
      next: () => {
        this.toast.success(this.isEdit ? 'Đã cập nhật' : 'Đã thêm');
        this.showModal = false;
        this.loadData();
      },
      error: (e) => this.toast.error('Lỗi: ' + e.error?.message)
    });
  }

  deleteChiPhi(id: number) {
    if (confirm('Xóa khoản chi này?')) {
      this.api.deleteChiPhi(id).subscribe({
        next: () => { this.toast.success('Đã xóa'); this.loadData(); },
        error: () => this.toast.error('Lỗi xóa')
      });
    }
  }
}