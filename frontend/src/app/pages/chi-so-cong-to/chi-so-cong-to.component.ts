import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ChiSoCongTo, PhongTro } from '../../services/api.service';

@Component({
  selector: 'app-chi-so-cong-to',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="page-header">
        <h1><i class='bx bx-tachometer text-gradient'></i> Chỉ số Điện/Nước</h1>
        <button class="btn btn-primary" (click)="openModal()">
            <i class='bx bx-plus-circle'></i> Ghi chỉ số
        </button>
      </div>

      <!-- Filters -->
      <div class="card p-4 mb-4">
        <div class="d-flex gap-3" style="flex-wrap: wrap;">
            <div class="form-group mb-0" style="flex: 1; min-width: 200px;">
               <label class="form-label">Phòng trọ</label>
               <select class="form-control" [(ngModel)]="filterPhongTroId" (change)="loadChiSoCongTos()">
                  <option value="">-- Tất cả phòng --</option>
                  <option *ngFor="let p of phongTros" [value]="p.id">{{ p.soPhong }} - {{ p.tenPhong }}</option>
               </select>
            </div>
            <div class="form-group mb-0" style="flex: 1; min-width: 150px;">
               <label class="form-label">Loại</label>
               <select class="form-control" [(ngModel)]="filterLoaiCongTo" (change)="loadChiSoCongTos()">
                  <option value="">-- Tất cả loại --</option>
                  <option value="Điện">Điện</option>
                  <option value="Nước">Nước</option>
               </select>
            </div>
            <div class="form-group mb-0" style="flex: 1; min-width: 150px;">
               <label class="form-label">Tháng/Năm</label>
               <input type="month" class="form-control" [(ngModel)]="filterThangNam" (change)="loadChiSoCongTos()">
            </div>
        </div>
      </div>

      <div class="card p-0">
        <div class="table-wrapper">
          <table class="table align-middle">
            <thead>
              <tr>
                <th>Phòng</th>
                <th>Loại</th>
                <th>Kỳ ghi</th>
                <th>Chỉ số cũ</th>
                <th>Chỉ số mới</th>
                <th>Tiêu thụ</th>
                <th class="text-right">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of chiSoCongTos">
                <td><strong>{{ item.soPhong }}</strong></td>
                <td>
                    <span class="badge" [class.badge-warning]="item.loaiCongTo==='Điện'" [class.badge-info]="item.loaiCongTo==='Nước'">
                        <i class='bx' [class.bxs-bolt]="item.loaiCongTo==='Điện'" [class.bxs-droplet]="item.loaiCongTo==='Nước'"></i> {{ item.loaiCongTo }}
                    </span>
                </td>
                <td>{{ item.thangNam | date:'MM/yyyy' }}</td>
                <td class="text-muted">{{ item.chiSoCu | number }}</td>
                <td style="font-weight: 700;">{{ item.chiSoMoi | number }}</td>
                <td><strong class="text-success">{{ item.soTieuThu | number }}</strong></td>
                <td class="text-right">
                    <button class="btn-icon-action edit" (click)="editChiSo(item)"><i class='bx bx-edit-alt'></i></button>
                    <button class="btn-icon-action delete" (click)="deleteChiSo(item.id)"><i class='bx bx-trash'></i></button>
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
          <h3 class="modal-title">{{ isEdit ? 'Sửa Chỉ Số' : 'Nhập Chỉ Số Mới' }}</h3>
          <button class="close-btn" (click)="closeModal()"><i class='bx bx-x'></i></button>
        </div>
        <form (ngSubmit)="saveChiSo()">
          <div class="form-group">
            <label class="form-label">Phòng trọ *</label>
            <select class="form-control" [(ngModel)]="formData.phongTroId" name="phongTroId" required (change)="loadGoiYChiSo()">
              <option value="">-- Chọn phòng --</option>
              <option *ngFor="let p of phongTros" [value]="p.id">{{ p.soPhong }} - {{ p.tenPhong }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Loại công tơ *</label>
            <select class="form-control" [(ngModel)]="formData.loaiCongTo" name="loaiCongTo" required (change)="loadGoiYChiSo()">
              <option value="Điện">Điện</option>
              <option value="Nước">Nước</option>
            </select>
          </div>
          <!-- PHẦN ĐÃ CHỈNH SỬA GIAO DIỆN (START) -->
          <div class="d-flex gap-3 mb-4"> 
             <!-- Cột Chỉ số cũ -->
             <div class="form-group w-100" style="position: relative;"> <!-- Thêm position relative -->
                <label class="form-label">Chỉ số cũ</label>
                <input type="number" class="form-control" [(ngModel)]="formData.chiSoCu" 
                       name="chiSoCu" [readonly]="goiYChiSo.chiSoCu > 0">
                <!-- Dòng gợi ý với position absolute -->
                <small *ngIf="goiYChiSo.chiSoCu > 0" class="text-muted" 
                       style="position: absolute; top: 100%; left: 0; margin-top: 4px; font-size: 12px; white-space: nowrap;">
                    Gợi ý từ tháng trước: {{goiYChiSo.chiSoCu}}
                </small>
             </div>

             <!-- Cột Chỉ số mới -->
             <div class="form-group w-100">
                <label class="form-label">Chỉ số mới *</label>
                <input type="number" class="form-control" [(ngModel)]="formData.chiSoMoi" 
                       name="chiSoMoi" required (change)="calculateSoTieuThu()" (keyup)="calculateSoTieuThu()">
             </div>
          </div>
          <div class="form-group">
             <label class="form-label">Kỳ ghi (Tháng/Năm) *</label>
             <input type="month" class="form-control" [(ngModel)]="formData.thangNam" 
                    name="thangNam" required>
          </div>
          <div class="form-group">
             <label class="form-label">Ghi chú</label>
             <textarea class="form-control" rows="2" [(ngModel)]="formData.ghiChu" name="ghiChu"></textarea>
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
export class ChiSoCongToComponent implements OnInit {
  chiSoCongTos: ChiSoCongTo[] = [];
  phongTros: PhongTro[] = [];
  showModal = false;
  isEdit = false;
  filterPhongTroId: any = '';
  filterLoaiCongTo: string = '';
  filterThangNam: string = '';
  formData: any = {
    phongTroId: null,
    loaiCongTo: 'Điện',
    chiSoCu: 0,
    chiSoMoi: 0,
    thangNam: '',
    ghiChu: ''
  };
  goiYChiSo: any = { chiSoCu: 0, chiSoMoiGoiY: 0 };
  editingId: number | null = null;

  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadPhongTros();
    this.filterThangNam = '';
    this.loadChiSoCongTos();
  }

  loadChiSoCongTos() {
    const params: any = {};
    if (this.filterPhongTroId) params.phongTroId = this.filterPhongTroId;
    if (this.filterLoaiCongTo) params.loaiCongTo = this.filterLoaiCongTo;
    if (this.filterThangNam) params.thangNam = this.filterThangNam + '-01'; 
    this.apiService.getChiSoCongTos(params.phongTroId, params.loaiCongTo, params.thangNam).subscribe(data => {
        this.chiSoCongTos = data;
    });
  }

  loadPhongTros() {
    this.apiService.getPhongTros().subscribe(data => this.phongTros = data);
  }

  loadGoiYChiSo() {
    if (this.formData.phongTroId && this.formData.loaiCongTo) {
      this.apiService.getGoiYChiSo(parseInt(this.formData.phongTroId), this.formData.loaiCongTo).subscribe(data => {
          this.goiYChiSo = data;
          if (!this.isEdit) {
            this.formData.chiSoCu = data.chiSoCu || 0;
            this.formData.chiSoMoi = data.chiSoMoiGoiY || 0;
          }
      });
    }
  }

  openModal() {
    this.isEdit = false;
    const now = new Date();
    this.formData = {
      phongTroId: null,
      loaiCongTo: 'Điện',
      chiSoCu: 0,
      chiSoMoi: 0,
      thangNam: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      ghiChu: ''
    };
    this.goiYChiSo = { chiSoCu: 0, chiSoMoiGoiY: 0 };
    this.showModal = true;
  }

  editChiSo(item: ChiSoCongTo) {
    this.isEdit = true;
    this.editingId = item.id;
    this.formData = {
      ...item,
      thangNam: item.thangNam.slice(0, 7)
    };
    this.showModal = true;
  }

  closeModal(event?: any) {
    if (!event || event.target === event.currentTarget) this.showModal = false;
  }

  saveChiSo() {
    const data = {
      ...this.formData,
      phongTroId: parseInt(this.formData.phongTroId),
      thangNam: this.formData.thangNam + '-01'
    };
    const req = this.isEdit ? this.apiService.updateChiSoCongTo(this.editingId!, data) : this.apiService.createChiSoCongTo(data);
    req.subscribe(() => {
        this.loadChiSoCongTos();
        this.closeModal();
        alert('Thành công!');
    });
  }

  deleteChiSo(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa chỉ số này?')) {
      this.apiService.deleteChiSoCongTo(id).subscribe(() => this.loadChiSoCongTos());
    }
  }

  calculateSoTieuThu() {
      if (this.formData.chiSoMoi >= this.formData.chiSoCu) {
        this.formData.soTieuThu = this.formData.chiSoMoi - this.formData.chiSoCu;
      }
  }
}