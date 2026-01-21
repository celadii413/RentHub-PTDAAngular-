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
                    <div style="font-weight: 600;">{{item.tenChiPhi}}</div>
                    <small class="text-muted">{{item.ghiChu}}</small>
                </td>
                <td style="color: #ef4444; font-weight: bold;">-{{item.soTien | number}} đ</td>
                <td><span class="badge badge-secondary" style="background: #e5e7eb; color: #374151;">{{item.loaiChiPhi}}</span></td>
                <td>{{item.tenDayTro}}</td>
                <td>{{item.ngayChi | date:'dd/MM/yyyy'}}</td>
                <td class="text-right">
                  <button class="btn-icon-action delete" (click)="deleteChiPhi(item.id)" style="color:red; border:none; background:none; cursor:pointer;"><i class='bx bx-trash' style="font-size:18px;"></i></button>
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

    <!-- Modal -->
    <div class="modal" *ngIf="showModal" (click)="closeModal($event)" style="display: flex; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); align-items: center; justify-content: center; z-index: 1000;">
      <div class="modal-content" style="background: white; padding: 20px; border-radius: 8px; width: 90%; max-width: 500px;">
        <div class="modal-header" style="display: flex; justify-content: space-between; margin-bottom: 20px;">
            <h3 style="margin: 0;">Thêm Khoản Chi</h3>
            <button (click)="closeModal()" style="border: none; background: none; font-size: 20px; cursor: pointer;">&times;</button>
        </div>
        <form (ngSubmit)="saveChiPhi()">
          <div class="form-group mb-3">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Tên khoản chi *</label>
            <input class="form-control" [(ngModel)]="formData.tenChiPhi" name="ten" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          <div class="d-flex gap-2 mb-3" style="display: flex; gap: 10px;">
             <div class="w-100" style="flex: 1;">
                <label style="display: block; margin-bottom: 5px; font-weight: 500;">Số tiền *</label>
                <input type="number" class="form-control" [(ngModel)]="formData.soTien" name="tien" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
             </div>
             <div class="w-100" style="flex: 1;">
                <label style="display: block; margin-bottom: 5px; font-weight: 500;">Loại chi phí</label>
                <select class="form-control" [(ngModel)]="formData.loaiChiPhi" name="loai" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                    <option value="Sửa chữa">Sửa chữa</option>
                    <option value="Điện lực">Tiền điện</option>
                    <option value="Nước">Tiền nước</option>
                    <option value="Internet">Internet</option>
                    <option value="Đầu tư">Đầu tư</option>
                    <option value="Khác">Khác</option>
                </select>
             </div>
          </div>
          <div class="form-group mb-3">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Chi cho dãy nào?</label>
            <select class="form-control" [(ngModel)]="formData.dayTroId" name="day" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                <option [ngValue]="null">-- Chi chung (Tất cả) --</option>
                <option *ngFor="let d of dayTros" [ngValue]="d.id">{{d.tenDayTro}}</option>
            </select>
          </div>
          <div class="form-group mb-3">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Ngày chi</label>
            <input type="date" class="form-control" [(ngModel)]="formData.ngayChi" name="ngay" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
          </div>
          <div class="form-group mb-4">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Ghi chú</label>
            <textarea class="form-control" [(ngModel)]="formData.ghiChu" name="gc" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;"></textarea>
          </div>
          <div class="modal-footer" style="text-align: right;">
             <button type="button" (click)="closeModal()" style="margin-right: 10px; padding: 8px 16px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">Hủy</button>
             <button type="submit" class="btn btn-primary" style="padding: 8px 16px; background: #6366f1; color: white; border: none; border-radius: 4px; cursor: pointer;">Lưu</button>
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
  formData: any = {};

  constructor(private api: ApiService, private toast: ToastService) {}

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
  
  closeModal(e?: any) { if(!e || e.target===e.currentTarget) this.showModal = false; }

  saveChiPhi() {
    this.api.createChiPhi(this.formData).subscribe({
      next: () => { this.toast.success('Đã thêm khoản chi'); this.showModal = false; this.loadData(); },
      error: (e) => this.toast.error('Lỗi: ' + (e.error?.message || 'Không thể lưu'))
    });
  }

  deleteChiPhi(id: number) {
    if(confirm('Xóa khoản chi này?')) {
        this.api.deleteChiPhi(id).subscribe({
            next: () => { this.toast.success('Đã xóa'); this.loadData(); },
            error: () => this.toast.error('Lỗi xóa')
        });
    }
  }
}