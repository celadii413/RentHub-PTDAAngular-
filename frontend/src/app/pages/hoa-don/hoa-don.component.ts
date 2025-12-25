import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { TemplateEditorModalComponent } from '../../components/template-editor-modal.component';

@Component({
  selector: 'app-hoa-don',
  standalone: true,
  imports: [CommonModule, FormsModule, TemplateEditorModalComponent],
  template: `
    <div class="container">
      <div class="page-header">
        <h1><i class='bx bx-receipt text-gradient'></i> Quản lý Hóa Đơn</h1>
        <div class="d-flex">
          <button class="btn btn-auto-calc" (click)="openModalTuDong()" style="margin-right: 10px;">
            <i class='bx bxs-magic-wand'></i> Tính tự động
          </button>
          <button class="btn btn-primary" (click)="openModal()">
             <i class='bx bx-plus'></i> Tạo thủ công
          </button>
        </div>
      </div>

      <div class="card p-0">
        <div class="table-wrapper">
          <table class="table">
            <thead>
              <tr>
                <th>Mã HĐ</th>
                <th>Phòng</th>
                <th>Tháng/Năm</th>
                <th>Chi tiết phí</th>
                <th>Tổng tiền</th>
                <th>Trạng thái</th>
                <th>Minh chứng</th>
                <th class="text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let hd of hoaDons">
                <td><small class="text-muted">#{{ hd.maHoaDon }}</small></td>
                <td><strong>{{ hd.soPhong }}</strong></td>
                <td>{{ hd.thangNam | date:'MM/yyyy' }}</td>
                <td>
                    <div style="font-size: 11px; color: var(--text-muted)">
                        <div>Điện: {{ hd.tienDien | number }}</div>
                        <div>Nước: {{ hd.tienNuoc | number }}</div>
                        <div>Phòng: {{ hd.tienPhong | number }}</div>
                    </div>
                </td>
                <td><strong style="color: var(--primary); font-size: 15px;">{{ hd.tongTien | number }} đ</strong></td>
                <td>
                  <span class="badge" [ngClass]="{
                    'badge-success': hd.trangThai === 'Đã thanh toán',
                    'badge-danger': hd.trangThai === 'Quá hạn',
                    'badge-warning': hd.trangThai === 'Chưa thanh toán'
                  }">{{ hd.trangThai }}</span>
                </td>
                <td>
                    <button *ngIf="hd.anhMinhChung" class="btn btn-sm btn-outline" (click)="viewProof(hd.anhMinhChung, hd.id)">
                        <i class='bx bx-image'></i> Xem ảnh
                    </button>
                    <span *ngIf="!hd.anhMinhChung" class="text-muted">-</span>
                </td>
                <td class="text-right">
                  <div class="d-flex justify-content-end" style="gap: 4px;">
                      <button class="btn-icon-action" (click)="exportPdf(hd.id)" title="Xuất PDF"><i class='bx bxs-file-pdf'></i></button>
                      <button class="btn-icon-action" (click)="sendEmail(hd.id)" title="Gửi Email"><i class='bx bx-envelope'></i></button>
                      <button class="btn-icon-action edit" (click)="editHoaDon(hd)" title="Sửa"><i class='bx bx-edit-alt'></i></button>
                      <button class="btn-icon-action delete" (click)="deleteHoaDon(hd.id)" title="Xóa"><i class='bx bx-trash'></i></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Tự Động -->
    <div class="modal" *ngIf="showModalTuDong" (click)="closeModalTuDong($event)">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Tính hóa đơn tự động</h3>
          <button class="close-btn" (click)="closeModalTuDong()"><i class='bx bx-x'></i></button>
        </div>
        <form (ngSubmit)="saveHoaDonTuDong()">
           <div class="form-group">
              <label class="form-label">Phòng trọ *</label>
              <select class="form-control" [(ngModel)]="formDataTuDong.phongTroId" name="phongTroId" required>
                 <option [ngValue]="null">-- Chọn phòng --</option>
                 <option *ngFor="let p of phongTros" [ngValue]="p.id">{{p.soPhong}} - {{p.tenPhong}}</option>
              </select>
           </div>
           <div class="form-group">
              <label class="form-label">Tháng/Năm *</label>
              <input type="month" class="form-control" [(ngModel)]="formDataTuDong.thangNam" name="thangNam" required>
           </div>
           <div class="card" style="background: var(--bg-input); font-size: 13px;">
              <i class='bx bx-info-circle'></i> Hệ thống sẽ tự động lấy chỉ số điện nước mới nhất, nhân với giá dịch vụ và cộng thêm tiền phòng + công nợ cũ.
           </div>
           <div class="modal-footer">
            <button type="button" class="btn btn-secondary" (click)="closeModalTuDong()">Hủy</button>
            <button type="submit" class="btn btn-primary">Thực hiện</button> 
          </div>
        </form>
      </div>
    </div>

    <!-- Modal Thủ công -->
    <div class="modal" *ngIf="showModal" (click)="closeModal($event)">
       <div class="modal-content">
          <div class="modal-header">
             <h3 class="modal-title">{{ isEdit ? 'Sửa hóa đơn' : 'Tạo hóa đơn' }}</h3>
             <button class="close-btn" (click)="closeModal()"><i class='bx bx-x'></i></button>
          </div>
          <form (ngSubmit)="saveHoaDon()">
             <div class="form-group">
                <label class="form-label">Phòng trọ *</label>
                <select class="form-control" [(ngModel)]="formData.phongTroId" name="phongId" required>
                   <option *ngFor="let p of phongTros" [value]="p.id">{{p.soPhong}} - {{p.tenPhong}}</option>
                </select>
             </div>
             <div class="form-group">
                <label class="form-label">Tháng/Năm *</label>
                <input type="month" class="form-control" [(ngModel)]="formData.thangNam" name="thangNam" required>
             </div>
             <div class="d-flex gap-2">
                <div class="form-group" style="flex:1"><label class="form-label">Tiền phòng</label><input type="number" class="form-control" [(ngModel)]="formData.tienPhong" name="tp"></div>
                <div class="form-group" style="flex:1"><label class="form-label">Công nợ cũ</label><input type="number" class="form-control" [(ngModel)]="formData.congNoThangTruoc" name="cn"></div>
             </div>
             <div class="d-flex gap-2">
                <div class="form-group" style="flex:1"><label class="form-label">Tiền Điện</label><input type="number" class="form-control" [(ngModel)]="formData.tienDien" name="td"></div>
                <div class="form-group" style="flex:1"><label class="form-label">Tiền Nước</label><input type="number" class="form-control" [(ngModel)]="formData.tienNuoc" name="tn"></div>
             </div>
             <div class="d-flex gap-2">
                <div class="form-group" style="flex:1"><label class="form-label">Internet</label><input type="number" class="form-control" [(ngModel)]="formData.tienInternet" name="ti"></div>
                <div class="form-group" style="flex:1"><label class="form-label">Vệ sinh</label><input type="number" class="form-control" [(ngModel)]="formData.tienVeSinh" name="tv"></div>
             </div>
             <div class="form-group">
                <label class="form-label">Trạng thái</label>
                <select class="form-control" [(ngModel)]="formData.trangThai" name="tt">
                   <option value="Chưa thanh toán">Chưa thanh toán</option>
                   <option value="Đã thanh toán">Đã thanh toán</option>
                   <option value="Quá hạn">Quá hạn</option>
                </select>
             </div>
             <div class="modal-footer">
                <button type="button" class="btn btn-secondary" (click)="closeModal()">Hủy</button>
                <button type="submit" class="btn btn-primary">Lưu</button>
             </div>
          </form>
       </div>
    </div>

    <!-- Modal Xem Ảnh -->
    <div class="modal" *ngIf="showProofModal" (click)="closeProofModal($event)">
       <div class="modal-content" style="text-align: center">
          <div class="modal-header">
             <h3 class="modal-title">Ảnh chuyển khoản</h3>
             <button class="close-btn" (click)="closeProofModal()">&times;</button>
          </div>
          <img [src]="viewProofUrl" style="max-width: 100%; border-radius: 8px; margin-bottom: 20px;">
          <div class="modal-footer" style="justify-content: space-between;">
             <button class="btn btn-danger" (click)="deleteProof()"><i class='bx bx-trash'></i> Từ chối & Xóa</button>
             <button class="btn btn-secondary" (click)="closeProofModal()">Đóng</button>
          </div>
       </div>
    </div>

    <app-template-editor-modal *ngIf="showEditorModal" [htmlContent]="previewHtml" title="Xem trước hóa đơn" (onClose)="showEditorModal=false" (onExport)="handleExportPdf($event)"></app-template-editor-modal>
  `
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
  
  formData: any = { phongTroId: null, thangNam: '', tienPhong: 0, tienDien: 0, tienNuoc: 0, tienInternet: 0, tienVeSinh: 0, congNoThangTruoc: 0, trangThai: 'Chưa thanh toán', ghiChu: '' };
  formDataTuDong: any = { phongTroId: null, thangNam: '' };
  editingId: number | null = null;

  constructor(private apiService: ApiService) { }

  ngOnInit() { this.loadHoaDons(); this.loadPhongTros(); }
  loadHoaDons() { this.apiService.getHoaDons().subscribe(data => this.hoaDons = data); }
  loadPhongTros() { this.apiService.getPhongTros().subscribe(data => this.phongTros = data); }

  openModal() {
    this.isEdit = false;
    const now = new Date();
    this.formData = { phongTroId: null, thangNam: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`, tienPhong: 0, tienDien: 0, tienNuoc: 0, tienInternet: 0, tienVeSinh: 0, congNoThangTruoc: 0, trangThai: 'Chưa thanh toán', ghiChu: '' };
    this.showModal = true;
  }
  openModalTuDong() { 
    const now = new Date();
    this.formDataTuDong = { phongTroId: null, thangNam: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}` };
    this.showModalTuDong = true; 
  }
  closeModalTuDong(e?: any) { if(!e || e.target===e.currentTarget) this.showModalTuDong = false; }
  closeModal(e?: any) { if(!e || e.target===e.currentTarget) this.showModal = false; }

  saveHoaDonTuDong() {
    if(!this.formDataTuDong.phongTroId || !this.formDataTuDong.thangNam) { alert('Thiếu thông tin'); return; }
    this.apiService.tuDongTinhHoaDon(this.formDataTuDong.phongTroId, this.formDataTuDong.thangNam).subscribe({
        next: () => { this.loadHoaDons(); this.closeModalTuDong(); alert('Thành công'); },
        error: (err) => alert(err.error?.message || 'Lỗi')
    });
  }

  saveHoaDon() {
    const data = { ...this.formData, phongTroId: parseInt(this.formData.phongTroId), thangNam: this.formData.thangNam + '-01' };
    const req = this.isEdit ? this.apiService.updateHoaDon(this.editingId!, data) : this.apiService.createHoaDon(data);
    req.subscribe(() => { this.loadHoaDons(); this.closeModal(); });
  }

  editHoaDon(hd: any) {
    this.isEdit = true; this.editingId = hd.id;
    this.formData = { ...hd, thangNam: hd.thangNam.slice(0, 7) };
    this.showModal = true;
  }

  deleteHoaDon(id: number) {
    if(confirm('Xóa hóa đơn này?')) this.apiService.deleteHoaDon(id).subscribe(() => this.loadHoaDons());
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

  viewProof(url: string, id: number) { this.viewProofUrl = url; this.selectedInvoiceId = id; this.showProofModal = true; }
  closeProofModal(e?: any) { if(!e || e.target===e.currentTarget) this.showProofModal = false; }
  
  deleteProof() {
    if(confirm('Chắc chắn xóa minh chứng này?')) {
        this.apiService.deletePaymentProof(this.selectedInvoiceId!).subscribe(() => {
            this.showProofModal = false; this.loadHoaDons();
        });
    }
  }
  
  sendEmail(id: number) {
    if(confirm('Gửi email thông báo cho khách?')) {
        this.apiService.sendHoaDonEmail(id).subscribe(() => alert('Đã gửi email'));
    }
  }
}