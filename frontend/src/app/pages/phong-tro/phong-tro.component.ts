import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, PhongTro, DayTro } from '../../services/api.service';
import { finalize, tap } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs'; 

@Component({
  selector: 'app-phong-tro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <div class="page-header">
        <h1><i class='bx bx-door-open text-gradient'></i> Quản lý Phòng Trọ</h1>
        <button class="btn btn-primary" (click)="openModal()">
            <i class='bx bx-plus-circle'></i> Thêm phòng mới
        </button>
      </div>

      <div class="card p-3 mb-3">
        <div class="d-flex" style="flex-wrap: wrap;">
            <div class="form-group mb-0" style="flex: 1; min-width: 200px;">
                <label class="form-label">Dãy trọ</label>
                <select class="form-control" [(ngModel)]="filterDayTroId" (change)="loadPhongTros()">
                    <option value="">Tất cả dãy</option>
                    <option *ngFor="let d of dayTros" [value]="d.id">{{d.tenDayTro}}</option>
                </select>
            </div>
            <div class="form-group mb-0" style="flex: 1; min-width: 200px;">
                <label class="form-label">Trạng thái</label>
                <select class="form-control" [(ngModel)]="filterTrangThai" (change)="loadPhongTros()">
                    <option value="">Tất cả</option>
                    <option value="Trống">Trống</option>
                    <option value="Đã thuê">Đã thuê</option>
                    <option value="Đang sửa chữa">Đang sửa chữa</option>
                </select>
            </div>
            <div class="form-group mb-0" style="flex: 1; min-width: 200px;">
                <label class="form-label">Chế độ xem</label>
                <select class="form-control" [(ngModel)]="viewMode">
                    <option value="table">Bảng</option>
                    <option value="grid">Lưới</option>
                </select>
            </div>
        </div>
      </div>

      <!-- TABLE VIEW -->
      <div class="card p-0" *ngIf="viewMode === 'table'">
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Thông tin phòng</th>
                <th>Dãy trọ</th>
                <th>Giá & Cọc</th>
                <th>Khách / Giới hạn</th>
                <th>Trạng thái</th>
                <th class="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let phong of phongTros">
                <td>
                    <div style="font-weight: 700; font-size: 15px;">{{ phong.soPhong }}</div>
                    <div class="text-muted" style="font-size: 12px;">{{ phong.tenPhong }} - Tầng {{ phong.tang }}</div>
                </td>
                <td>{{ phong.tenDayTro }}</td>
                <td>
                    <div>Giá: <span style="color: var(--success)">{{ phong.giaThue | number }}</span></div>
                    <div class="text-muted" style="font-size: 12px;">Cọc: {{ phong.tienCoc | number }}</div>
                </td>
                <td>
                    <span class="d-flex"><i class='bx bxs-user'></i> {{ phong.soKhachThue }} / {{ phong.gioiHanSoNguoi }}</span>
                </td>
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-success': phong.trangThai === 'Trống',
                    'badge-info': phong.trangThai === 'Đã thuê',
                    'badge-warning': phong.trangThai === 'Đang sửa chữa'
                  }">{{ phong.trangThai }}</span>
                </td>
                <td class="text-right">
                  <button class="btn-icon-action edit" (click)="editPhong(phong)" title="Sửa"><i class='bx bx-edit-alt'></i></button>
                  <button class="btn-icon-action delete" (click)="deletePhong(phong.id)" title="Xóa"><i class='bx bx-trash'></i></button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- GRID VIEW -->
      <div class="grid-view" *ngIf="viewMode === 'grid'" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 20px;">
        <div class="card" *ngFor="let phong of phongTros" style="margin-bottom: 0;">
            <div class="d-flex" style="justify-content: space-between; margin-bottom: 10px;">
                <h3 style="margin: 0;">{{ phong.soPhong }}</h3>
                <span class="badge" [ngClass]="'badge-' + getStatusClass(phong.trangThai).split('-')[1]">{{ phong.trangThai }}</span>
            </div>
            <p class="text-muted">{{ phong.tenDayTro }} - {{ phong.tenPhong }}</p>
            <hr style="border-color: var(--border); opacity: 0.5;">
            <div style="margin: 10px 0;">
                <div class="d-flex justify-content-between"><span>Giá:</span> <strong>{{ phong.giaThue | number }}</strong></div>
                <div class="d-flex justify-content-between"><span>Khách:</span> <span>{{ phong.soKhachThue }}/{{ phong.gioiHanSoNguoi }}</span></div>
            </div>
            <div class="d-flex" style="margin-top: 15px;">
                <button class="btn btn-outline w-100" (click)="editPhong(phong)">Sửa</button>
                <button class="btn btn-danger w-100" (click)="deletePhong(phong.id)">Xóa</button>
            </div>
        </div>
      </div>
    </div>

    <!-- MODAL -->
    <div class="modal" *ngIf="showModal" (click)="closeModal($event)">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEdit ? 'Cập nhật Phòng' : 'Thêm Phòng Mới' }}</h3>
          <button class="close-btn" (click)="closeModal()"><i class='bx bx-x'></i></button>
        </div>
        <form (ngSubmit)="savePhong()">
          <div class="form-group">
            <label class="form-label">Dãy Trọ *</label>
            <select class="form-control" [(ngModel)]="formData.dayTroId" name="dayTroId" required>
              <option value="">-- Chọn dãy trọ --</option>
              <option *ngFor="let day of dayTros" [value]="day.id">{{ day.tenDayTro }}</option>
            </select>
          </div>
          <div class="d-flex gap-2">
              <div class="form-group" style="flex: 1">
                <label class="form-label">Số Phòng *</label>
                <input class="form-control" [(ngModel)]="formData.soPhong" name="soPhong" [disabled]="isEdit" required>
              </div>
              <div class="form-group" style="flex: 1">
                <label class="form-label">Tầng *</label>
                <input type="number" class="form-control" [(ngModel)]="formData.tang" name="tang" required>
              </div>
          </div>
          <div class="form-group">
            <label class="form-label">Tên Phòng (Mô tả ngắn) *</label>
            <input class="form-control" [(ngModel)]="formData.tenPhong" name="tenPhong" required>
          </div>
          <div class="d-flex gap-2">
              <div class="form-group" style="flex: 1">
                <label class="form-label">Giá Thuê *</label>
                <input type="number" class="form-control" [(ngModel)]="formData.giaThue" name="giaThue" required>
              </div>
              <div class="form-group" style="flex: 1">
                <label class="form-label">Tiền Cọc *</label>
                <input type="number" class="form-control" [(ngModel)]="formData.tienCoc" name="tienCoc" required>
              </div>
          </div>
          <div class="d-flex gap-2">
              <div class="form-group" style="flex: 1">
                <label class="form-label">Diện Tích (m²)</label>
                <input type="number" class="form-control" [(ngModel)]="formData.dienTich" name="dienTich" required>
              </div>
              <div class="form-group" style="flex: 1">
                <label class="form-label">Giới Hạn Người *</label>
                <input type="number" class="form-control" [(ngModel)]="formData.gioiHanSoNguoi" name="gioiHanSoNguoi" required>
              </div>
          </div>
          <div class="form-group">
            <label class="form-label">Trạng Thái</label>
            <select class="form-control" [(ngModel)]="formData.trangThai" name="trangThai">
              <option value="Trống">Trống</option>
              <option value="Đã thuê">Đã thuê</option>
              <option value="Đang sửa chữa">Đang sửa chữa</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Hình Ảnh (Tối đa 3)</label>
            <div class="d-flex gap-2" style="flex-wrap: wrap;">
              <div *ngFor="let key of ['hinhAnh1', 'hinhAnh2', 'hinhAnh3']" style="flex: 1; min-width: 100px;">
                  <input type="file" class="form-control" style="font-size: 11px;" (change)="onFileSelect($event, key)" accept="image/*">
                  <div *ngIf="currentImages[key]" style="position: relative; margin-top: 5px;">
                    <img [src]="currentImages[key]!" style="width: 100%; height: 80px; object-fit: cover; border-radius: 4px;">
                    <button type="button" (click)="clearImage(key)" style="position: absolute; top: 0; right: 0; background: red; color: white; border: none; cursor: pointer;">&times;</button>
                  </div>
              </div>
            </div>
            <small *ngIf="imageUploading" style="color: var(--info)">Đang upload ảnh...</small>
          </div>

          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Hủy</button>
            <button type="submit" class="btn btn-primary" [disabled]="imageUploading">
                <i class='bx bx-save'></i> Lưu lại
            </button>
          </div>
        </form>
      </div>
    </div>
  `
})
export class PhongTroComponent implements OnInit {
  phongTros: PhongTro[] = [];
  dayTros: DayTro[] = [];
  showModal = false;
  isEdit = false;
  viewMode: 'table' | 'grid' = 'table';
  filterDayTroId: any = '';
  filterTang: any = '';
  filterTrangThai: string = '';
  
  formData: any = {
    soPhong: '', tenPhong: '', tang: 1, giaThue: 0, tienCoc: 0, dienTich: 0, dayTroId: null,
    trangThai: 'Trống', moTa: '', gioiHanSoNguoi: 2,
    hinhAnh1: null, hinhAnh2: null, hinhAnh3: null
  };
  editingId: number | null = null;

  imageFiles: { [key: string]: File | null } = { hinhAnh1: null, hinhAnh2: null, hinhAnh3: null };
  currentImages: { [key: string]: string | null } = { hinhAnh1: null, hinhAnh2: null, hinhAnh3: null };
  imageUploading = false;
  
  constructor(private apiService: ApiService) {}

  ngOnInit() {
    this.loadPhongTros();
    this.loadDayTros();
  }

  loadDayTros() {
    this.apiService.getDayTros().subscribe(data => this.dayTros = data);
  }

  loadPhongTros() {
    this.apiService.getPhongTros(
      this.filterDayTroId ? parseInt(this.filterDayTroId) : undefined,
      this.filterTang ? parseInt(this.filterTang) : undefined,
      this.filterTrangThai || undefined
    ).subscribe(data => this.phongTros = data);
  }

  openModal() {
    this.isEdit = false;
    this.formData = {
      soPhong: '', tenPhong: '', tang: 1, giaThue: 0, tienCoc: 0, dienTich: 0, dayTroId: null,
      trangThai: 'Trống', moTa: '', gioiHanSoNguoi: 2,
      hinhAnh1: null, hinhAnh2: null, hinhAnh3: null
    };
    this.editingId = null;
    this.currentImages = { hinhAnh1: null, hinhAnh2: null, hinhAnh3: null };
    this.imageFiles = { hinhAnh1: null, hinhAnh2: null, hinhAnh3: null };
    this.showModal = true;
  }

  editPhong(phong: PhongTro) {
    this.isEdit = true;
    this.editingId = phong.id;
    this.formData = { ...phong };
    this.currentImages['hinhAnh1'] = phong.hinhAnh1 || null;
    this.currentImages['hinhAnh2'] = phong.hinhAnh2 || null;
    this.currentImages['hinhAnh3'] = phong.hinhAnh3 || null;
    this.imageFiles = { hinhAnh1: null, hinhAnh2: null, hinhAnh3: null }; 
    this.showModal = true;
  }

  closeModal(event?: any) {
    if (!event || event.target === event.currentTarget) {
      this.showModal = false;
    }
  }

  async savePhong() {
        if (!this.formData.dayTroId) {
            alert('Vui lòng chọn Dãy trọ.');
            return;
        }
        
        this.imageUploading = true;
        try {
            for (const key of Object.keys(this.imageFiles)) {
                const file = this.imageFiles[key];
                if (file) {
                    const res = await firstValueFrom(this.apiService.uploadImage(file, 'phong-tro')); 
                    this.formData[key] = res.fileUrl;
                }
            }
        } catch (error) {
            this.imageUploading = false;
            alert('Lỗi upload ảnh.');
            return;
        } finally {
            this.imageUploading = false;
        }
        
        const data = {
            ...this.formData,
            dayTroId: parseInt(this.formData.dayTroId),
            gioiHanSoNguoi: parseInt(this.formData.gioiHanSoNguoi),
            hinhAnh1: this.formData['hinhAnh1'] || null, 
            hinhAnh2: this.formData['hinhAnh2'] || null, 
            hinhAnh3: this.formData['hinhAnh3'] || null, 
        };

        const apiCall = this.isEdit 
            ? this.apiService.updatePhongTro(this.editingId!, data)
            : this.apiService.createPhongTro(data);

        apiCall.pipe(
            tap(() => alert('Thành công!')),
            finalize(() => {
                this.loadPhongTros();
                this.closeModal();
            })
        ).subscribe({
            error: (err) => alert(err.error?.message || 'Có lỗi xảy ra')
        });
    }

  deletePhong(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa phòng trọ này?')) {
      this.apiService.deletePhongTro(id).subscribe(() => this.loadPhongTros());
    }
  }

  onFileSelect(event: any, key: string) {
      const file = event.target.files[0];
      if (file) {
        this.imageFiles[key] = file;
        const reader = new FileReader();
        reader.onload = (e: any) => { this.currentImages[key] = e.target.result; };
        reader.readAsDataURL(file);
    }
  }

  clearImage(key: string) {
    this.imageFiles[key] = null;
    this.currentImages[key] = null;
    this.formData[key] = null;
  }

  getStatusClass(status: string): string {
    switch (status) {
      case 'Trống': return 'success';
      case 'Đã thuê': return 'info';
      case 'Đang sửa chữa': return 'warning';
      default: return 'info';
    }
  }
}