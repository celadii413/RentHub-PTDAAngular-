import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, DichVu, DayTro, PhongTro } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-dich-vu',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './dich-vu.component.html',
  styleUrls: ['./dich-vu.component.css']
})
export class DichVuComponent implements OnInit {
  dichVus: DichVu[] = [];
  dayTros: DayTro[] = [];
  phongTros: PhongTro[] = [];
  showModal = false;
  isEdit = false;
  formData: any = {
    tenDichVu: 'Điện',
    donViTinh: 'kWh',
    giaMacDinh: 0,
    loaiGia: 'Chung',
    dayTroId: null,
    phongTroId: null
  };
  editingId: number | null = null;

  constructor(private apiService: ApiService, private toastService: ToastService) { }

  ngOnInit() {
    this.loadDichVus();
    this.loadDayTros();
    this.loadPhongTros();
  }

  loadDichVus() {
    this.apiService.getDichVus().subscribe(data => this.dichVus = data);
  }

  loadDayTros() {
    this.apiService.getDayTros().subscribe(data => this.dayTros = data);
  }

  loadPhongTros() {
    this.apiService.getPhongTros().subscribe(data => this.phongTros = data);
  }

  openModal() {
    this.isEdit = false;
    this.formData = { tenDichVu: 'Điện', donViTinh: 'kWh', giaMacDinh: 0, loaiGia: 'Chung', dayTroId: null, phongTroId: null };
    this.showModal = true;
  }

  editDichVu(dv: DichVu) {
    this.isEdit = true;
    this.editingId = dv.id;
    this.formData = { ...dv };
    this.showModal = true;
  }

  onLoaiGiaChange() {
    if (this.formData.loaiGia === 'Chung') { this.formData.dayTroId = null; this.formData.phongTroId = null; }
    else if (this.formData.loaiGia === 'Theo dãy') this.formData.phongTroId = null;
    else if (this.formData.loaiGia === 'Theo phòng') this.formData.dayTroId = null;
  }

  closeModal(event?: any) { if (!event || event.target === event.currentTarget) this.showModal = false; }

  saveDichVu() {
    const data = {
      ...this.formData,
      dayTroId: this.formData.dayTroId ? parseInt(this.formData.dayTroId) : null,
      phongTroId: this.formData.phongTroId ? parseInt(this.formData.phongTroId) : null
    };
    const req = this.isEdit ? this.apiService.updateDichVu(this.editingId!, data) : this.apiService.createDichVu(data);
    req.subscribe({
      next: () => {
        this.loadDichVus();
        this.closeModal();
        this.toastService.success(this.isEdit ? 'Cập nhật dịch vụ thành công!' : 'Thêm dịch vụ mới thành công!');
      },
      error: (err) => this.toastService.error(err.error?.message || 'Lỗi khi lưu dịch vụ')
    });
  }

  deleteDichVu(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      this.apiService.deleteDichVu(id).subscribe({
        next: () => {
          this.loadDichVus();
          this.toastService.success('Đã xóa dịch vụ!');
        },
        error: (err) => this.toastService.error(err.error?.message || 'Lỗi khi xóa dịch vụ')
      });
    }
  }
}