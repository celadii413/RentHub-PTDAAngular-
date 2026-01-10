import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, HopDong, PhongTro, KhachThue } from '../../services/api.service';
import { TemplateEditorModalComponent } from '../../components/template-editor-modal.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-hop-dong',
  standalone: true,
  imports: [CommonModule, FormsModule, TemplateEditorModalComponent],
  templateUrl: './hop-dong.component.html',
  styleUrls: ['./hop-dong.component.css']
})
export class HopDongComponent implements OnInit {
  hopDongs: HopDong[] = [];
  phongTros: PhongTro[] = [];
  khachThues: KhachThue[] = [];
  filteredKhachThues: KhachThue[] = [];

  showModal = false;
  isEdit = false;
  showEditorModal = false;
  previewHtml = '';
  currentExportId: number | null = null;

  formData: any = {
    phongTroId: null,
    khachThueId: null,
    ngayBatDau: '',
    ngayKetThuc: '',
    giaThue: 0,
    tienCoc: 0,
    ghiChu: ''
  };
  editingId: number | null = null;

  constructor(private apiService: ApiService, private toastService: ToastService) { }

  ngOnInit() {
    this.loadHopDongs();
    this.loadPhongTros();
    this.loadKhachThues();
  }

  loadHopDongs() {
    this.apiService.getHopDongs().subscribe(data => this.hopDongs = data);
  }

  loadPhongTros() {
    this.apiService.getPhongTros().subscribe(data => this.phongTros = data);
  }

  loadKhachThues() {
    this.apiService.getKhachThues().subscribe(data => this.khachThues = data);
  }

  openModal() {
    this.isEdit = false;
    this.formData = { phongTroId: null, khachThueId: null, ngayBatDau: '', ngayKetThuc: '', giaThue: 0, tienCoc: 0, ghiChu: '' };
    this.filteredKhachThues = [];
    this.showModal = true;
  }

  editHopDong(hd: HopDong) {
    this.isEdit = true;
    this.editingId = hd.id;
    this.formData = {
      phongTroId: hd.phongTroId,
      khachThueId: hd.khachThueId,
      ngayBatDau: new Date(hd.ngayBatDau).toISOString().split('T')[0],
      ngayKetThuc: new Date(hd.ngayKetThuc).toISOString().split('T')[0],
      giaThue: hd.giaThue,
      tienCoc: hd.tienCoc,
      ghiChu: hd.ghiChu || '',
      trangThai: hd.trangThai
    };
    this.filterKhachByPhong(hd.phongTroId);
    this.showModal = true;
  }

  closeModal(event?: any) {
    if (!event || event.target === event.currentTarget) this.showModal = false;
  }

  saveHopDong() {
    const data = {
      ...this.formData,
      phongTroId: parseInt(this.formData.phongTroId),
      khachThueId: parseInt(this.formData.khachThueId),
      ngayBatDau: new Date(this.formData.ngayBatDau),
      ngayKetThuc: new Date(this.formData.ngayKetThuc)
    };

    const request = this.isEdit
      ? this.apiService.updateHopDong(this.editingId!, data)
      : this.apiService.createHopDong(data);

    request.subscribe({
      next: () => {
        this.loadHopDongs();
        this.closeModal();
        this.toastService.success(this.isEdit ? 'Cập nhật hợp đồng thành công!' : 'Tạo hợp đồng mới thành công!');
      },
      error: (err) => this.toastService.error(err.error?.message || 'Có lỗi xảy ra')
    });
  }

  ketThucHopDong(id: number) {
    if (confirm('Bạn có chắc chắn muốn kết thúc hợp đồng này?')) {
      this.apiService.ketThucHopDong(id).subscribe({
        next: () => {
          this.loadHopDongs();
          this.toastService.success('Đã kết thúc hợp đồng!');
        },
        error: (err) => this.toastService.error(err.error?.message || 'Lỗi kết thúc hợp đồng')
      });
    }
  }

  deleteHopDong(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) {
      this.apiService.deleteHopDong(id).subscribe({
        next: () => {
          this.loadHopDongs();
          this.toastService.success('Đã xóa hợp đồng vĩnh viễn!');
        },
        error: (err) => this.toastService.error(err.error?.message || 'Lỗi xóa hợp đồng')
      });
    }
  }


  onPhongChange() {
    this.formData.khachThueId = null;
    if (this.formData.phongTroId) {
      this.filterKhachByPhong(parseInt(this.formData.phongTroId));
    } else {
      this.filteredKhachThues = [];
    }
  }

  filterKhachByPhong(phongId: number) {
    this.filteredKhachThues = this.khachThues.filter(k =>
      k.phongTroId === phongId && !k.ngayKetThucThue
    );
  }

  previewAndExport(id: number) {
    this.currentExportId = id;
    this.apiService.getPreviewHopDong(id).subscribe(res => {
      this.previewHtml = res.html;
      this.showEditorModal = true;
    });
  }

  handleExportPdf(finalHtml: string) {
    this.apiService.exportPdfFromHtml(finalHtml).subscribe(blob => {
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `HopDong_${new Date().getTime()}.pdf`;
      link.click();
      this.showEditorModal = false;
    });
  }

  sendContractEmail(id: number) {
    if (confirm('Gửi hợp đồng qua email cho khách?')) {
      this.apiService.sendHopDongEmail(id).subscribe({
        next: () => this.toastService.success('Đã gửi email hợp đồng thành công!'),
        error: (err) => this.toastService.error('Gửi email thất bại: ' + (err.error?.message || 'Lỗi server'))
      });
    }
  }
}