import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { TemplateEditorModalComponent } from '../../components/template-editor-modal.component';
import { ToastService } from '../../services/toast.service';

@Component({
  selector: 'app-bieu-mau',
  standalone: true,
  imports: [CommonModule, FormsModule, TemplateEditorModalComponent],
  templateUrl: './bieu-mau.component.html',
  styleUrls: ['./bieu-mau.component.css']
})
export class BieuMauComponent implements OnInit {
  showModal = false;
  currentType = '';
  currentContent = '';
  currentTitle = '';
  currentId = 0;
  defaultHopDong =
    `<p style="text-align:center"><strong>CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</strong></p>
  <h2 style="text-align:center">HỢP ĐỒNG THUÊ</h2>`;
  defaultHoaDon = `<h2 style="text-align:center">HÓA ĐƠN TIỀN NHÀ</h2><p>Tháng: {{THANG_NAM}}</p>`;

  constructor(private api: ApiService, private toastService: ToastService) { }
  ngOnInit() { }

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
      next: () => {
        this.toastService.success('Lưu mẫu in ấn thành công!');
        this.showModal = false;
      },
      error: (err) => this.toastService.error('Lỗi lưu mẫu: ' + err.error?.message)
    });
  }

  closeModal() {
    this.showModal = false;
  }
}