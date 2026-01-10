import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, ChiSoCongTo, PhongTro } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-chi-so-cong-to',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chi-so-cong-to.component.html',
  styleUrls: ['./chi-so-cong-to.component.css']
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
  goiYChiSo: any = {
    chiSoCu: 0,
    chiSoMoiGoiY: 0
  };
  editingId: number | null = null;

  constructor(private apiService: ApiService, private toastService: ToastService) { }

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
    const data = { ...this.formData, phongTroId: parseInt(this.formData.phongTroId), thangNam: this.formData.thangNam + '-01' };
    const req = this.isEdit ? this.apiService.updateChiSoCongTo(this.editingId!, data) : this.apiService.createChiSoCongTo(data);
    req.subscribe({
      next: () => {
        this.loadChiSoCongTos();
        this.closeModal();
        this.toastService.success(this.isEdit ? 'Cập nhật chỉ số thành công!' : 'Ghi chỉ số mới thành công!');
      },
      error: (err) => this.toastService.error(err.error?.message || 'Lỗi khi lưu chỉ số')
    });
  }

  deleteChiSo(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa chỉ số này?')) {
      this.apiService.deleteChiSoCongTo(id).subscribe({
        next: () => {
          this.loadChiSoCongTos();
          this.toastService.success('Đã xóa chỉ số!');
        },
        error: (err) => this.toastService.error(err.error?.message || 'Lỗi xóa chỉ số')
      });
    }
  }

  calculateSoTieuThu() {
    if (this.formData.chiSoMoi >= this.formData.chiSoCu) {
      this.formData.soTieuThu = this.formData.chiSoMoi - this.formData.chiSoCu;
    }
  }
}