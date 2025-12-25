import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, HopDong, PhongTro, KhachThue } from '../../services/api.service';
import { TemplateEditorModalComponent } from '../../components/template-editor-modal.component';

@Component({
  selector: 'app-hop-dong',
  standalone: true,
  imports: [CommonModule, FormsModule, TemplateEditorModalComponent],
  template: `
    <div class="container">
      <div class="page-header">
        <h1><i class='bx bx-file text-gradient'></i> Quản lý Hợp Đồng</h1>
        <button class="btn btn-primary" (click)="openModal()">
            <i class='bx bx-plus-circle'></i> Tạo hợp đồng mới
        </button>
      </div>

      <div class="card p-0">
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Mã HĐ</th>
                <th>Phòng & Khách</th>
                <th>Thời hạn</th>
                <th>Giá trị (VNĐ)</th>
                <th>Trạng thái</th>
                <th class="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let hd of hopDongs">
                <td><small class="text-muted">#{{ hd.maHopDong }}</small></td>
                <td>
                    <div style="font-weight: 600">{{ hd.soPhong }}</div>
                    <div style="font-size: 12px; color: var(--text-muted);"><i class='bx bx-user'></i> {{ hd.tenKhachThue }}</div>
                </td>
                <td>
                    <div style="font-size: 13px;">{{ hd.ngayBatDau | date:'dd/MM/yyyy' }} <i class='bx bx-right-arrow-alt' style="vertical-align: middle"></i> {{ hd.ngayKetThuc | date:'dd/MM/yyyy' }}</div>
                </td>
                <td>
                    <div>Thuê: <span class="text-success">{{ hd.giaThue | number }}</span></div>
                    <div style="font-size: 12px; color: var(--text-muted);">Cọc: {{ hd.tienCoc | number }}</div>
                </td>
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-success': hd.trangThai === 'Đang hiệu lực',
                    'badge-danger': hd.trangThai === 'Đã kết thúc',
                    'badge-secondary': hd.trangThai === 'Đã hủy'
                  }">{{ hd.trangThai }}</span>
                </td>
                <td class="text-right">
                  <div class="d-flex justify-content-end" style="gap: 4px;">
                      <button class="btn-icon-action" (click)="previewAndExport(hd.id)" title="Xuất PDF"><i class='bx bxs-file-pdf'></i></button>
                      <button class="btn-icon-action" (click)="sendContractEmail(hd.id)" title="Gửi Email"><i class='bx bx-envelope'></i></button>
                      <button class="btn-icon-action edit" (click)="editHopDong(hd)" title="Sửa"><i class='bx bx-edit-alt'></i></button>
                      
                      <button *ngIf="hd.trangThai === 'Đang hiệu lực'" class="btn-icon-action" style="color: #f59e0b" (click)="ketThucHopDong(hd.id)" title="Kết thúc sớm"><i class='bx bx-stop-circle'></i></button>
                      
                      <button class="btn-icon-action delete" (click)="deleteHopDong(hd.id)" title="Xóa"><i class='bx bx-trash'></i></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Tạo/Sửa -->
    <div class="modal" *ngIf="showModal" (click)="closeModal($event)">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">{{ isEdit ? 'Cập nhật Hợp Đồng' : 'Tạo Hợp Đồng Mới' }}</h3>
          <button class="close-btn" (click)="closeModal()"><i class='bx bx-x'></i></button>
        </div>
        <form (ngSubmit)="saveHopDong()">
          <div class="form-group">
            <label class="form-label">Phòng trọ *</label>
            <select class="form-control" [(ngModel)]="formData.phongTroId" name="phongTroId" required (change)="onPhongChange()">
              <option [ngValue]="null">-- Chọn phòng --</option>
              <option *ngFor="let p of phongTros" [ngValue]="p.id">{{ p.soPhong }} - {{ p.tenPhong }}</option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Khách thuê (Đã gán vào phòng) *</label>
            <select class="form-control" [(ngModel)]="formData.khachThueId" name="khachThueId" required>
              <option [ngValue]="null">-- Chọn khách --</option>
              <option *ngFor="let k of filteredKhachThues" [ngValue]="k.id">{{ k.hoTen }} ({{ k.cccd }})</option>
            </select>
            <small *ngIf="formData.phongTroId && filteredKhachThues.length === 0" style="color: var(--danger)">
               Phòng này chưa có khách. Vui lòng thêm khách vào phòng trước.
            </small>
          </div>
          <div class="d-flex gap-2">
             <div class="form-group" style="flex:1">
                <label class="form-label">Ngày bắt đầu *</label>
                <input type="date" class="form-control" [(ngModel)]="formData.ngayBatDau" name="ngayBatDau" required>
             </div>
             <div class="form-group" style="flex:1">
                <label class="form-label">Ngày kết thúc *</label>
                <input type="date" class="form-control" [(ngModel)]="formData.ngayKetThuc" name="ngayKetThuc" required>
             </div>
          </div>
          <div class="d-flex gap-2">
             <div class="form-group" style="flex:1">
                <label class="form-label">Giá thuê *</label>
                <input type="number" class="form-control" [(ngModel)]="formData.giaThue" name="giaThue" required>
             </div>
             <div class="form-group" style="flex:1">
                <label class="form-label">Tiền cọc *</label>
                <input type="number" class="form-control" [(ngModel)]="formData.tienCoc" name="tienCoc" required>
             </div>
          </div>
          <div class="form-group">
            <label class="form-label">Ghi chú</label>
            <textarea class="form-control" rows="2" [(ngModel)]="formData.ghiChu" name="ghiChu"></textarea>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModal()">Hủy</button>
            <button type="submit" class="btn btn-primary">Lưu lại</button>
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Editor -->
    <app-template-editor-modal 
      *ngIf="showEditorModal" 
      [htmlContent]="previewHtml"
      title="Xem trước Hợp đồng"  
      (onClose)="showEditorModal = false"
      (onExport)="handleExportPdf($event)">
    </app-template-editor-modal>
  `
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

  constructor(private apiService: ApiService) { }

  ngOnInit() {
    this.loadHopDongs();
    this.loadPhongTros();
    this.loadKhachThues();
  }

  loadHopDongs() { this.apiService.getHopDongs().subscribe(data => this.hopDongs = data); }
  loadPhongTros() { this.apiService.getPhongTros().subscribe(data => this.phongTros = data); }
  loadKhachThues() { this.apiService.getKhachThues().subscribe(data => this.khachThues = data); }

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
        next: () => { this.loadHopDongs(); this.closeModal(); },
        error: (err) => alert(err.error?.message || 'Có lỗi xảy ra')
    });
  }

  ketThucHopDong(id: number) {
    if (confirm('Bạn có chắc chắn muốn kết thúc hợp đồng này?')) {
      this.apiService.ketThucHopDong(id).subscribe(() => this.loadHopDongs());
    }
  }

  deleteHopDong(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa hợp đồng này?')) {
      this.apiService.deleteHopDong(id).subscribe(() => this.loadHopDongs());
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
      this.apiService.sendHopDongEmail(id).subscribe(() => alert('Đã gửi email thành công!'));
    }
  }
}