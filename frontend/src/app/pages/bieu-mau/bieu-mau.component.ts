import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { TemplateEditorModalComponent } from '../../components/template-editor-modal.component';

@Component({
  selector: 'app-bieu-mau',
  standalone: true,
  imports: [CommonModule, FormsModule, TemplateEditorModalComponent],
  template: `
    <div class="container">
      <div class="page-header">
        <h1><i class='bx bx-printer text-gradient'></i> Biểu Mẫu In Ấn</h1>
      </div>

      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 30px;">
        
        <!-- Card Hợp Đồng -->
        <div class="template-card p-4 rounded-xl cursor-pointer" (click)="openEditor('HOP_DONG')">
           <div style="font-size: 50px; color: var(--success); margin-bottom: 16px;"><i class='bx bxs-file-doc'></i></div>
           <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Mẫu Hợp Đồng</h3>
           <p class="text-muted mb-4" style="font-size: 14px;">Chỉnh sửa nội dung hợp đồng thuê phòng, điều khoản và thông tin bên A, bên B.</p>
           <button class="btn btn-outline w-100">Chỉnh sửa ngay <i class='bx bx-right-arrow-alt'></i></button>
        </div>

        <!-- Card Hóa Đơn -->
        <div class="template-card p-4 rounded-xl cursor-pointer" (click)="openEditor('HOA_DON')">
           <div style="font-size: 50px; color: var(--success); margin-bottom: 16px;"><i class='bx bxs-receipt'></i></div>
           <h3 style="font-size: 20px; font-weight: 700; margin-bottom: 8px;">Mẫu Hóa Đơn</h3>
           <p class="text-muted mb-4" style="font-size: 14px;">Tùy chỉnh giao diện phiếu thu tiền điện, nước và dịch vụ hàng tháng.</p>
           <button class="btn btn-outline w-100">Chỉnh sửa ngay <i class='bx bx-right-arrow-alt'></i></button>
        </div>
      </div>
    </div>

    <!-- Modal Editor -->
    <app-template-editor-modal 
      *ngIf="showModal" 
      [htmlContent]="currentContent"
      [title]="currentTitle"
      (onClose)="closeModal()"
      (onExport)="saveTemplate($event)">
    </app-template-editor-modal>
  `
})
export class BieuMauComponent implements OnInit {
  showModal = false; currentType = ''; currentContent = ''; currentTitle = ''; currentId = 0;
  defaultHopDong = `<p style="text-align:center"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong></p><h2 style="text-align:center">HỢP ĐỒNG THUÊ TRỌ</h2>`;
  defaultHoaDon = `<h2 style="text-align:center">HÓA ĐƠN TIỀN NHÀ</h2><p>Tháng: {{THANG_NAM}}</p>`;

  constructor(private api: ApiService) {}
  ngOnInit() {}

  decodeHtml(html: string) {
    if (!html) return '';
    const txt = document.createElement('textarea');
    txt.innerHTML = html;
    return txt.value;
  }

  openEditor(type: string) {
    this.currentType = type;
    this.currentTitle = type === 'HOP_DONG' ? 'Chỉnh sửa Mẫu Hợp Đồng' : 'Chỉnh sửa Mẫu Hóa Đơn';
    this.api.getBieuMaus().subscribe({
      next: (list) => {
        const existing = list.find(b => b.loaiBieuMau === type || b.LoaiBieuMau === type);
        this.currentId = existing ? (existing.id || existing.Id) : 0;
        this.currentContent = existing ? this.decodeHtml(existing.noiDung || existing.NoiDung) : (type === 'HOP_DONG' ? this.defaultHopDong : this.defaultHoaDon);
        this.showModal = true;
      },
      error: () => {
        this.currentContent = type === 'HOP_DONG' ? this.defaultHopDong : this.defaultHoaDon;
        this.showModal = true;
      }
    });
  }

  saveTemplate(content: string) {
    this.api.saveBieuMau({ id: this.currentId, tenBieuMau: this.currentTitle, loaiBieuMau: this.currentType, noiDung: content }).subscribe({
      next: () => { alert('Lưu mẫu thành công!'); this.showModal = false; },
      error: (err) => alert('Lỗi: ' + err.error?.message)
    });
  }
  closeModal() { this.showModal = false; }
}