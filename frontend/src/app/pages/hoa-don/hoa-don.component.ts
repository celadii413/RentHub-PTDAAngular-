import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { TemplateEditorModalComponent } from '../../components/template-editor-modal.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-hoa-don',
  standalone: true,
  imports: [CommonModule, FormsModule, TemplateEditorModalComponent],
  templateUrl: './hoa-don.component.html',
  styleUrls: ['./hoa-don.component.css']
})
export class HoaDonComponent implements OnInit {
  hoaDons: any[] = [];
  phongTros: any[] = [];
  showModal = false;
  showModalTuDong = false;
  isEdit = false;
  showEditorModal = false;
  previewHtml = '';
  currentExportId: number | null = null;
  showProofModal = false;
  viewProofUrl = '';
  selectedInvoiceId: number | null = null;

  formData: any = {
    phongTroId: null,
    thangNam: '',
    tienPhong: 0,
    tienDien: 0,
    tienNuoc: 0,
    tienInternet: 0,
    tienVeSinh: 0,
    congNoThangTruoc: 0,
    trangThai: 'Chưa thanh toán',
    ghiChu: ''
  };
  formDataTuDong: any = {
    phongTroId: null,
    thangNam: ''
  };
  editingId: number | null = null;

  constructor(private apiService: ApiService, private toastService: ToastService) { }

  ngOnInit() {
    this.loadHoaDons(); this.loadPhongTros();
  }

  loadHoaDons() {
    this.apiService.getHoaDons().subscribe(data => this.hoaDons = data);
  }

  loadPhongTros() {
    this.apiService.getPhongTros().subscribe(data => this.phongTros = data);
  }

  openModal() {
    this.isEdit = false;
    const now = new Date();
    this.formData = {
      phongTroId: null,
      thangNam: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
      tienPhong: 0,
      tienDien: 0,
      tienNuoc: 0,
      tienInternet: 0,
      tienVeSinh: 0,
      congNoThangTruoc: 0,
      trangThai: 'Chưa thanh toán',
      ghiChu: ''
    };
    this.showModal = true;
  }

  openModalTuDong() {
    const now = new Date();
    this.formDataTuDong = {
      phongTroId: null,
      thangNam: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`
    };
    this.showModalTuDong = true;
  }

  closeModalTuDong(e?: any) {
    if (!e || e.target === e.currentTarget) this.showModalTuDong = false;
  }

  closeModal(e?: any) {
    if (!e || e.target === e.currentTarget) this.showModal = false;
  }

  saveHoaDonTuDong() {
    if (!this.formDataTuDong.phongTroId || !this.formDataTuDong.thangNam) {
      this.toastService.warning('Vui lòng chọn phòng và tháng!');
      return;
    }
    this.apiService.tuDongTinhHoaDon(this.formDataTuDong.phongTroId, this.formDataTuDong.thangNam).subscribe({
      next: () => {
        this.loadHoaDons();
        this.closeModalTuDong();
        this.toastService.success('Đã tính toán và tạo hóa đơn tự động thành công!');
      },
      error: (err) => this.toastService.error(err.error?.message || 'Lỗi tính hóa đơn')
    });
  }

  saveHoaDon() {
    const data = { ...this.formData, phongTroId: parseInt(this.formData.phongTroId), thangNam: this.formData.thangNam + '-01' };
    const req = this.isEdit ? this.apiService.updateHoaDon(this.editingId!, data) : this.apiService.createHoaDon(data);
    req.subscribe({
      next: () => {
        this.loadHoaDons();
        this.closeModal();
        this.toastService.success(this.isEdit ? 'Cập nhật hóa đơn thành công!' : 'Tạo hóa đơn thủ công thành công!');
      },
      error: (err) => this.toastService.error(err.error?.message || 'Lỗi lưu hóa đơn')
    });
  }

  editHoaDon(hd: any) {
    this.isEdit = true; this.editingId = hd.id;
    this.formData = { ...hd, thangNam: hd.thangNam.slice(0, 7) };
    this.showModal = true;
  }

  deleteHoaDon(id: number) {
    if (confirm('Xóa hóa đơn này?')) {
      this.apiService.deleteHoaDon(id).subscribe({
        next: () => {
          this.loadHoaDons();
          this.toastService.success('Đã xóa hóa đơn!');
        },
        error: (err) => this.toastService.error(err.error?.message || 'Lỗi xóa hóa đơn')
      });
    }
  }

  exportPdf(id: number) {
    this.currentExportId = id;
    this.apiService.getPreviewHoaDon(id).subscribe(res => { this.previewHtml = res.html; this.showEditorModal = true; });
  }

  handleExportPdf(html: string) {
    this.apiService.exportPdfFromHtml(html).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a'); link.href = url; link.download = 'HoaDon.pdf'; link.click();
      this.showEditorModal = false;
    });
  }

  viewProof(url: string, id: number) {
    this.viewProofUrl = url; this.selectedInvoiceId = id; this.showProofModal = true;
  }

  closeProofModal(e?: any) {
    if (!e || e.target === e.currentTarget) this.showProofModal = false;
  }

  deleteProof() {
    if (confirm('Chắc chắn xóa minh chứng này?')) {
      this.apiService.deletePaymentProof(this.selectedInvoiceId!).subscribe({
        next: () => {
          this.showProofModal = false;
          this.loadHoaDons();
          this.toastService.success('Đã xóa minh chứng và từ chối thanh toán!');
        },
        error: (err) => this.toastService.error('Lỗi khi xóa minh chứng')
      });
    }
  }

  sendEmail(id: number) {
    if (confirm('Gửi email thông báo cho khách?')) {
      this.apiService.sendHoaDonEmail(id).subscribe({
        next: () => this.toastService.success('Đã gửi email hóa đơn thành công!'),
        error: (err) => this.toastService.error('Gửi email thất bại: ' + (err.error?.message))
      });
    }
  }
}