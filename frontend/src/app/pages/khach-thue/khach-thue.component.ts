import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, PhongTro } from '../../services/api.service';

@Component({
  selector: 'app-khach-thue',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container-fluid">
      <div class="page-header">
        <h1><i class='bx bx-user-circle text-gradient'></i> Quản lý Khách Thuê</h1>
        <button class="btn btn-primary" (click)="openModal()">
            <i class='bx bx-user-plus'></i> Thêm khách mới
        </button>
      </div>

      <div class="d-flex mb-4 gap-3">
         <button class="btn" [class.btn-secondary]="activeTab!=='current'" [class.btn-primary]="activeTab==='current'" (click)="activeTab='current'">
            <i class='bx bx-check-circle'></i> Đang thuê 
            <span class="badge badge-warning ml-2 text-dark">{{currentTenants.length}}</span>
         </button>
         <button class="btn" [class.btn-secondary]="activeTab!=='past'" [class.btn-primary]="activeTab==='past'" (click)="activeTab='past'">
            <i class='bx bx-history'></i> Đã trả phòng
            <span class="badge badge-secondary ml-2">{{pastTenants.length}}</span>
         </button>
      </div>

      <div class="card p-0">
        <div class="table-wrapper">
          <table class="table align-middle">
            <thead>
              <tr>
                <th style="width: 250px;">Thông tin khách</th>
                <th>Phòng</th>
                <th>Liên hệ</th>
                <th>Ngày bắt đầu</th>
                <th class="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let k of displayedTenants">
                <td>
                   <div class="d-flex align-items-center gap-3">
                      <div class="avatar-placeholder">{{ k.hoTen.charAt(0) }}</div>
                      <div>
                         <div class="font-bold text-main">{{ k.hoTen }}</div>
                         <div class="text-xs text-muted">CCCD: {{ k.cccd }}</div>
                      </div>
                   </div>
                </td>
                <td>
                   <span class="badge badge-info font-bold" style="font-size: 13px;">{{ k.soPhong }}</span>
                </td>
                <td>
                   <div class="contact-info"><i class='bx bx-phone'></i> {{ k.soDienThoai }}</div>
                   <div class="contact-info mt-1"><i class='bx bx-envelope'></i> {{ k.email || '---' }}</div>
                </td>
                <td>{{ k.ngayBatDauThue | date:'dd/MM/yyyy' }}</td>
                <td class="text-right">
                   <button class="btn-icon-action edit" (click)="editKhach(k)" title="Chỉnh sửa"><i class='bx bx-edit-alt'></i></button>
                   <ng-container *ngIf="activeTab==='current'">
                      <button class="btn-icon-action" style="color: #f59e0b" (click)="openModalChuyenPhong(k)" title="Chuyển phòng"><i class='bx bx-transfer'></i></button>
                      <button class="btn-icon-action" style="color: #ef4444" (click)="openModalTraPhong(k)" title="Trả phòng"><i class='bx bx-log-out-circle'></i></button>
                   </ng-container>
                   <button class="btn-icon-action delete" (click)="deleteKhach(k.id)"><i class='bx bx-trash'></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- MODAL THÊM/SỬA KHÁCH -->
    <div class="modal" *ngIf="showModal" (click)="closeModal($event)">
       <div class="modal-content">
          <div class="modal-header">
             <h3 class="modal-title">{{ isEdit ? 'Cập nhật thông tin' : 'Thêm khách thuê mới' }}</h3>
             <button class="close-btn" (click)="closeModal()"><i class='bx bx-x'></i></button>
          </div>
          <form (ngSubmit)="saveKhach()">
             <div class="form-group">
                <label class="form-label">Họ và tên *</label>
                <input class="form-control" [(ngModel)]="formData.hoTen" name="hoTen" required>
             </div>
             <div class="d-flex gap-4"> 
                <div class="form-group w-100">
                    <label class="form-label">Số điện thoại</label>
                    <input class="form-control" [(ngModel)]="formData.soDienThoai" name="sdt">
                </div>
                <div class="form-group w-100">
                    <label class="form-label">CCCD</label>
                    <input class="form-control" [(ngModel)]="formData.cccd" name="cccd">
                </div>
             </div>
             <div class="form-group">
                <label class="form-label">Email</label>
                <input class="form-control" [(ngModel)]="formData.email" name="email" type="email">
             </div>

             <div class="d-flex gap-4 align-items-start"> 
                <div class="form-group w-100 mb-0">
                    <label class="form-label">Phòng trọ *</label>
                    <select class="form-control" [(ngModel)]="formData.phongTroId" name="phongId" required (change)="onPhongTroChange()">
                       <option [ngValue]="null">-- Chọn phòng --</option>
                       <option *ngFor="let p of phongTros" [value]="p.id">{{p.soPhong}} - {{p.tenPhong}}</option>
                    </select>

                    <div class="input-helper-box">
                        <span *ngIf="gioiHanMessage" [class.text-success-bold]="!isRoomFull" [class.text-danger-bold]="isRoomFull">
                            <i class='bx' [ngClass]="isRoomFull ? 'bx-error-circle' : 'bx-check-circle'"></i> 
                            {{ gioiHanMessage }}
                        </span>
                    </div>
                </div>
                
                <div class="form-group w-100 mb-0">
                    <label class="form-label">Ngày bắt đầu *</label>
                    <input type="date" class="form-control" [(ngModel)]="formData.ngayBatDauThue" name="start" required>
                    <div class="input-helper-box"></div> 
                </div>
             </div>

             <div class="form-group mt-3">
                <label class="form-label">Địa chỉ thường trú</label>
                <input class="form-control" [(ngModel)]="formData.diaChiThuongTru" name="dctt">
             </div>
             
             <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu lại</button>
             </div>
          </form>
       </div>
    </div>

    <!-- Modal Chuyển Phòng & Trả Phòng -->
    <div class="modal" *ngIf="showModalChuyenPhong" (click)="closeModalChuyenPhong($event)">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Chuyển Phòng</h3>
          <button class="close-btn" (click)="closeModalChuyenPhong()"><i class='bx bx-x'></i></button>
        </div>
        <form (ngSubmit)="saveChuyenPhong()">
          <div class="form-group"><label class="form-label">Khách thuê</label><input class="form-control" [value]="chuyenPhongData.tenKhach" disabled></div>
          <div class="form-group"><label class="form-label">Phòng hiện tại</label><input class="form-control" [value]="chuyenPhongData.phongHienTai" disabled></div>
          <div class="form-group">
            <label class="form-label">Chuyển đến phòng *</label>
            <select class="form-control" [(ngModel)]="chuyenPhongData.phongTroMoiId" name="phongMoi" required>
              <option value="">-- Chọn phòng --</option>
              <option *ngFor="let p of phongTros" [value]="p.id" [disabled]="p.id===chuyenPhongData.phongTroCuId">{{p.soPhong}} - {{p.tenPhong}}</option>
            </select>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModalChuyenPhong()">Hủy</button>
            <button type="submit" class="btn btn-primary">Xác nhận chuyển</button>
          </div>
        </form>
      </div>
    </div>

    <div class="modal" *ngIf="showModalTraPhong" (click)="closeModalTraPhong($event)">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title text-danger">Xác nhận Trả Phòng</h3>
          <button class="close-btn" (click)="closeModalTraPhong()"><i class='bx bx-x'></i></button>
        </div>
        <form (ngSubmit)="saveTraPhong()">
          <p>Bạn có chắc chắn muốn làm thủ tục trả phòng cho khách <strong>{{traPhongData.tenKhach}}</strong>?</p>
          <div class="form-group"><label class="form-label">Ngày trả phòng</label><input type="date" class="form-control" [(ngModel)]="traPhongData.ngayTraPhong" name="ngayTra" required></div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModalTraPhong()">Hủy</button>
            <button type="submit" class="btn btn-danger">Xác nhận trả</button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .avatar-placeholder { width: 42px; height: 42px; background: linear-gradient(135deg, #6366f1, #a855f7); color: white; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 16px; }
    .font-bold { font-weight: 600; }
    .text-xs { font-size: 12px; }
    .text-main { color: var(--text-main); }
    .align-middle td { vertical-align: middle; }
    .contact-info { display: flex; align-items: center; gap: 6px; color: var(--text-muted); font-size: 13px; }

    .input-helper-box { min-height: 24px; margin-top: 6px; font-size: 12px; display: flex; align-items: center; }
    .text-success-bold { color: #10b981; font-weight: 600; display: flex; align-items: center; gap: 4px; }
    .text-danger-bold { color: #ef4444; font-weight: 600; display: flex; align-items: center; gap: 4px; }
  `]
})
export class KhachThueComponent implements OnInit {
  khachThues: any[] = []; 
  activeTab: 'current' | 'past' = 'current'; 
  phongTros: PhongTro[] = []; 
  showModal = false; 
  isEdit = false; 
  formData: any = { 
    hoTen: '', 
    soDienThoai: '', 
    email: '', 
    cccd: '', 
    diaChiThuongTru: '', 
    phongTroId: null, 
    ngayBatDauThue: '' }; 
    editingId: number | null = null; 
    selectedPhongTro: PhongTro | null = null; 
    gioiHanMessage = ''; isRoomFull = false; 
    showModalChuyenPhong = false; 
    chuyenPhongData: any = {}; 
    showModalTraPhong = false; 
    traPhongData: any = {};

  constructor(private apiService: ApiService) {}
  ngOnInit() { 
    this.loadKhachThues(); this.loadPhongTros(); 
  }

  get displayedTenants() { 
    return this.activeTab === 'current' ? this.currentTenants : this.pastTenants; 
  }

  get currentTenants() { 
    return this.khachThues.filter(k => !k.ngayKetThucThue); 
  }

  get pastTenants() { 
    return this.khachThues.filter(k => k.ngayKetThucThue); 
  }

  loadKhachThues() { 
    this.apiService.getKhachThues().subscribe(data => this.khachThues = data); 
  }

  loadPhongTros() { 
    this.apiService.getPhongTros().subscribe(data => this.phongTros = data); 
  }
  
  openModal() { 
    this.isEdit = false; 
    this.formData = { hoTen: '', phongTroId: null, ngayBatDauThue: '' }; 
    this.gioiHanMessage = ''; 
    this.showModal = true; 
  }

  editKhach(k: any) { 
    this.isEdit = true; 
    this.editingId = k.id; 
    this.formData = { ...k }; 
    this.showModal = true; 
  }

  closeModal(e?: any) { 
    if(!e || e.target===e.currentTarget) this.showModal = false; 
  }

  saveKhach() { 
    const data = { ...this.formData, phongTroId: parseInt(this.formData.phongTroId) }; 
    const req = this.isEdit ? this.apiService.updateKhachThue(this.editingId!, data) : this.apiService.createKhachThue(data); 
    req.subscribe(() => { 
      this.loadKhachThues(); 
      this.loadPhongTros(); 
      this.closeModal(); 
    }); 
  }

  deleteKhach(id: number) { 
    if(confirm('Xóa khách này?')) this.apiService.deleteKhachThue(id).subscribe(() => this.loadKhachThues()); 
  }

  onPhongTroChange() {
    const pid = parseInt(this.formData.phongTroId);
    this.selectedPhongTro = this.phongTros.find(p => p.id === pid) || null;
    if(this.selectedPhongTro) {
        if(this.selectedPhongTro.soKhachThue >= this.selectedPhongTro.gioiHanSoNguoi) {
            this.gioiHanMessage = 'Phòng đã đầy (Hết chỗ)';
            this.isRoomFull = true;
        } else {
            const trong = this.selectedPhongTro.gioiHanSoNguoi - this.selectedPhongTro.soKhachThue;
            this.gioiHanMessage = `Còn trống ${trong} chỗ`;
            this.isRoomFull = false;
        }
    } else {
        this.gioiHanMessage = '';
    }
  }

  openModalChuyenPhong(k: any) { 
    this.chuyenPhongData = { khachThueId: k.id, tenKhach: k.hoTen, phongHienTai: k.soPhong, phongTroCuId: k.phongTroId, phongTroMoiId: null }; 
    this.showModalChuyenPhong = true; 
  }

  closeModalChuyenPhong(e?: any) { 
    if(!e || e.target===e.currentTarget) this.showModalChuyenPhong = false; 
  }

  saveChuyenPhong() { 
    this.apiService.chuyenPhong(this.chuyenPhongData.khachThueId, { 
      phongTroMoiId: parseInt(this.chuyenPhongData.phongTroMoiId) }).subscribe(() => { 
        this.loadKhachThues(); 
        this.loadPhongTros(); 
        this.closeModalChuyenPhong(); 
    }); 
  }
  openModalTraPhong(k: any) { 
    this.traPhongData = { khachThueId: k.id, tenKhach: k.hoTen, ngayTraPhong: new Date().toISOString().split('T')[0] }; 
    this.showModalTraPhong = true;
  }

  closeModalTraPhong(e?: any) { 
    if(!e || e.target===e.currentTarget) this.showModalTraPhong = false; 
  }

  saveTraPhong() { 
    this.apiService.traPhong(this.traPhongData.khachThueId, { 
      ngayTraPhong: new Date(this.traPhongData.ngayTraPhong) 
    })
    .subscribe(() => { 
      this.loadKhachThues(); 
      this.loadPhongTros(); 
      this.closeModalTraPhong(); 
    }); 
  }
}