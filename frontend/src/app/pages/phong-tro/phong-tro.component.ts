import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, PhongTro, DayTro } from '../../services/api.service';
import { finalize, tap } from 'rxjs/operators';
import { firstValueFrom } from 'rxjs';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-phong-tro',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './phong-tro.component.html',
  styleUrls: ['./phong-tro.component.css']
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
    soPhong: '',
    tenPhong: '',
    tang: 1,
    giaThue: 0,
    tienCoc: 0,
    dienTich: 0,
    dayTroId: null,
    trangThai: 'Trống',
    moTa: '',
    gioiHanSoNguoi: 2,
    hinhAnh1: null,
    hinhAnh2: null,
    hinhAnh3: null
  };
  editingId: number | null = null;

  imageFiles: { [key: string]: File | null } = {
    hinhAnh1: null,
    hinhAnh2: null,
    hinhAnh3: null
  };
  currentImages: { [key: string]: string | null } = {
    hinhAnh1: null,
    hinhAnh2: null,
    hinhAnh3: null
  };
  imageUploading = false;

  constructor(private apiService: ApiService, private toastService: ToastService) { }

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
      soPhong: '',
      tenPhong: '',
      tang: 1,
      giaThue: 0,
      tienCoc: 0,
      dienTich: 0,
      dayTroId: null,
      trangThai: 'Trống',
      moTa: '',
      gioiHanSoNguoi: 2,
      hinhAnh1: null,
      hinhAnh2: null,
      hinhAnh3: null
    };
    this.editingId = null;
    this.currentImages = {
      hinhAnh1: null,
      hinhAnh2: null,
      hinhAnh3: null
    };
    this.imageFiles = {
      hinhAnh1: null,
      hinhAnh2: null,
      hinhAnh3: null
    };
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
      this.toastService.warning('Vui lòng chọn Dãy nhà.');
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
      this.toastService.error('Lỗi khi tải ảnh lên server.');
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

    apiCall.subscribe({
      next: () => {
        this.loadPhongTros();
        this.closeModal();
        this.toastService.success(this.isEdit ? 'Cập nhật phòng thành công!' : 'Thêm phòng mới thành công!');
      },
      error: (err) => this.toastService.error(err.error?.message || 'Có lỗi xảy ra khi lưu phòng')
    });
  }

  deletePhong(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa phòng này?')) {
      this.apiService.deletePhongTro(id).subscribe({
        next: () => {
          this.loadPhongTros();
          this.toastService.success('Đã xóa phòng thành công!');
        },
        error: (err) => this.toastService.error(err.error?.message || 'Lỗi khi xóa phòng')
      });
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