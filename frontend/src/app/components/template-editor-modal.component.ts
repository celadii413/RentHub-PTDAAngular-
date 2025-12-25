import { Component, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { QuillModule, QuillEditorComponent } from 'ngx-quill';
import Quill from 'quill';

const Font = Quill.import('formats/font') as any;
Font.whitelist = ['times-new-roman', 'arial', 'roboto', 'mirza']; 
Quill.register(Font, true);

@Component({
  selector: 'app-template-editor-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, QuillModule],
  template: `
    <div class="modal-overlay" (click)="close()">
      <div class="modal-container" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h2>{{ title }}</h2>
          <button class="close-btn" (click)="close()">&times;</button>
        </div>
        
        <div class="custom-actions">
           <button class="btn-sm btn-outline" (click)="insertTable()">Chèn Bảng Mẫu</button>
           <span class="hint-text">(Hoặc copy bảng từ Word/Excel dán vào)</span>
        </div>

        <div class="modal-body-layout">
          <div class="editor-column">
            <quill-editor 
              #editor
              [(ngModel)]="htmlContent" 
              [modules]="quillConfig"
              class="quill-editor-custom"
              placeholder="Nhập nội dung mẫu in..."
              (onEditorCreated)="initEditorContent($event)">
            </quill-editor>
          </div>

          <div class="sidebar-column">
             <h3>Từ khóa gợi ý</h3>
             <p class="sidebar-desc">Click để copy, sau đó <strong>Ctrl+V</strong> vào khung soạn thảo.</p>
             <div class="keyword-list">
                <div class="keyword-group" *ngIf="isHopDong">
                  <h4>Thông tin chung</h4>
                  <button class="badge-btn" (click)="copyKeyword('{{MA_HOP_DONG}}')">Mã HĐ</button>
                  <button class="badge-btn" (click)="copyKeyword('{{NGAY_TAO}}')">Ngày tạo</button>
                  <h4>Phòng & Giá</h4>
                  <button class="badge-btn" (click)="copyKeyword('{{TEN_PHONG}}')">Tên phòng</button>
                  <button class="badge-btn" (click)="copyKeyword('{{GIA_THUE}}')">Giá thuê</button>
                  <button class="badge-btn" (click)="copyKeyword('{{TIEN_COC}}')">Tiền cọc</button>
                  <h4>Khách thuê</h4>
                  <button class="badge-btn" (click)="copyKeyword('{{TEN_KHACH}}')">Tên khách</button>
                  <button class="badge-btn" (click)="copyKeyword('{{CCCD}}')">CCCD</button>
                  <button class="badge-btn" (click)="copyKeyword('{{SO_DIEN_THOAI}}')">SĐT</button>
                  <button class="badge-btn" (click)="copyKeyword('{{DIA_CHI_THUONG_TRU}}')">Địa chỉ</button>
                  <h4>Thời hạn</h4>
                  <button class="badge-btn" (click)="copyKeyword('{{NGAY_BAT_DAU}}')">Ngày bắt đầu</button>
                  <button class="badge-btn" (click)="copyKeyword('{{NGAY_KET_THUC}}')">Ngày kết thúc</button>
                  <h4>Chủ trọ</h4>
                  <button class="badge-btn" (click)="copyKeyword('{{TEN_CHU_TRO}}')">Tên chủ</button>
                  <button class="badge-btn" (click)="copyKeyword('{{SDT_CHU_TRO}}')">SĐT chủ</button>
                </div>

                <div class="keyword-group" *ngIf="!isHopDong">
                  <h4>Hóa đơn</h4>
                  <button class="badge-btn" (click)="copyKeyword('{{MA_HOA_DON}}')">Mã HĐ</button>
                  <button class="badge-btn" (click)="copyKeyword('{{THANG_NAM}}')">Tháng/Năm</button>
                  <button class="badge-btn" (click)="copyKeyword('{{TEN_PHONG}}')">Tên phòng</button>
                  <button class="badge-btn" (click)="copyKeyword('{{TEN_KHACH}}')">Tên khách</button>
                  <button class="badge-btn" (click)="copyKeyword('{{TIEN_PHONG}}')">Tiền phòng</button>
                  <button class="badge-btn" (click)="copyKeyword('{{TIEN_DIEN}}')">Tiền điện</button>
                  <button class="badge-btn" (click)="copyKeyword('{{TIEN_NUOC}}')">Tiền nước</button>
                  <button class="badge-btn" (click)="copyKeyword('{{TIEN_DICH_VU}}')">Dịch vụ</button>
                  <button class="badge-btn" (click)="copyKeyword('{{CONG_NO}}')">Công nợ</button>
                  <button class="badge-btn highlight" (click)="copyKeyword('{{TONG_TIEN}}')">TỔNG TIỀN</button>
                </div>
             </div>
          </div>
        </div>

        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="close()">Hủy</button>
          <button class="btn btn-primary" (click)="export()" [disabled]="isProcessing">
            {{ isProcessing ? 'Đang xử lý...' : (title.includes('Xuất') ? 'Xuất PDF' : 'Lưu Mẫu') }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* ... (Giữ nguyên các style layout cũ: modal-overlay, modal-container...) ... */
    .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 1000; display: flex; align-items: center; justify-content: center; }
    .modal-container { background: #ffffff !important; color: #1f2937 !important; width: 95%; height: 90vh; border-radius: 8px; display: flex; flex-direction: column; max-width: 1400px; overflow: hidden; }
    .modal-header { padding: 15px; border-bottom: 1px solid #eee; display: flex; justify-content: space-between; align-items: center; flex-shrink: 0; }
    .modal-footer { padding: 15px; border-top: 1px solid #eee; display: flex; justify-content: flex-end; gap: 10px; flex-shrink: 0; }
    .modal-body-layout { flex: 1; display: flex; overflow: hidden; min-height: 0; }
    .editor-column { flex: 3; display: flex; flex-direction: column; border-right: 1px solid #eee; height: 100%; overflow: hidden; }
    .sidebar-column { flex: 1; min-width: 250px; max-width: 300px; padding: 15px; background: #f9fafb; overflow-y: auto; }
    .sidebar-column h3 { font-size: 16px; margin-top: 0; margin-bottom: 5px; color: #374151; }
    .sidebar-desc { font-size: 12px; color: #6b7280; margin-bottom: 15px; }
    .keyword-group h4 { font-size: 13px; color: #9ca3af; text-transform: uppercase; margin: 15px 0 8px; font-weight: 600; }
    .badge-btn { display: inline-block; background: white; border: 1px solid #d1d5db; padding: 4px 8px; margin: 3px; border-radius: 4px; font-size: 12px; cursor: pointer; font-family: monospace; color: #4b5563; transition: all 0.2s; }
    .badge-btn:hover { border-color: #6366f1; color: #6366f1; background: #eef2ff; }
    .badge-btn.highlight { border-color: #f59e0b; color: #b45309; background: #fffbeb; font-weight: bold; }
    .btn { padding: 8px 16px; border: none; border-radius: 4px; cursor: pointer; }
    .btn-secondary { background: #6c757d; color: white; }
    .btn-primary { background: #6366f1; color: white; }
    .close-btn { background: none; border: none; font-size: 1.5rem; cursor: pointer; }
    .custom-actions { padding: 8px 15px; background: #f8f9fa; border-bottom: 1px solid #eee; display: flex; align-items: center; gap: 10px; }
    .btn-sm { padding: 4px 10px; font-size: 13px; border-radius: 4px; border: 1px solid #6366f1; background: white; color: #6366f1; cursor: pointer; }
    .btn-sm:hover { background: #6366f1; color: white; }
    .hint-text { font-size: 12px; color: #888; font-style: italic; }
    
    /* Cấu hình Quill Editor Layout */
    quill-editor { display: flex; flex-direction: column; height: 100%; overflow: hidden; }
    ::ng-deep .ql-toolbar { flex-shrink: 0; background: #fff; border-bottom: 1px solid #ccc; z-index: 1; }
    ::ng-deep .ql-container { flex: 1; display: flex; flex-direction: column; overflow: hidden; border: none !important; }
    ::ng-deep .ql-editor { flex: 1; overflow-y: auto; padding: 20px; font-size: 16px; line-height: 1.5; color: #000; }
    ::ng-deep .ql-editor table { border-collapse: collapse; width: 100%; margin: 10px 0; }
    ::ng-deep .ql-editor table td, ::ng-deep .ql-editor table th { border: 1px solid #000; padding: 8px; min-width: 50px; }

    /* ============================================================
       PHẦN QUAN TRỌNG: ĐỊNH NGHĨA FONT CHỮ THỰC TẾ
       (Giúp văn bản đổi font khi chọn trên menu)
       ============================================================ */
    
    /* 1. Font Times New Roman */
    ::ng-deep .ql-font-times-new-roman { 
      font-family: "Times New Roman", Times, serif !important; 
    }

    /* 2. Font Arial */
    ::ng-deep .ql-font-arial { 
      font-family: "Arial", Helvetica, sans-serif !important; 
    }

    /* 3. Font Roboto (cần import font này ở index.html hoặc styles.css global nếu chưa có) */
    ::ng-deep .ql-font-roboto { 
      font-family: 'Roboto', sans-serif !important; 
    }

    ::ng-deep .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="times-new-roman"]::before,
    ::ng-deep .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="times-new-roman"]::before {
      content: 'Times New Roman';
      font-family: 'Times New Roman', serif;
    }

    ::ng-deep .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="arial"]::before,
    ::ng-deep .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="arial"]::before {
      content: 'Arial';
      font-family: 'Arial', sans-serif;
    }

    ::ng-deep .ql-snow .ql-picker.ql-font .ql-picker-label[data-value="roboto"]::before,
    ::ng-deep .ql-snow .ql-picker.ql-font .ql-picker-item[data-value="roboto"]::before {
      content: 'Roboto';
      font-family: 'Roboto', sans-serif;
    }

    /* Mở rộng chiều rộng menu để hiển thị đủ tên font */
    ::ng-deep .ql-snow .ql-picker.ql-font { 
      width: 170px !important; 
    }
  `]
})
export class TemplateEditorModalComponent {
  @Input() title = 'Xem trước và Chỉnh sửa';
  @Input() htmlContent = '';
  @Output() onClose = new EventEmitter<void>();
  @Output() onExport = new EventEmitter<string>();

  @ViewChild('editor') editorComponent!: QuillEditorComponent;

  isProcessing = false;
  quillConfig: any = {
    toolbar: [
      [{ 'font': ['times-new-roman', 'arial', false] }, { 'size': ['small', false, 'large', 'huge'] }],
      ['bold', 'italic', 'underline'],
      [{ 'align': [] }, { 'color': [] }, { 'background': [] }],
      [{ 'list': 'ordered'}, { 'list': 'bullet' }, { 'indent': '-1'}, { 'indent': '+1' }],
      [{ 'header': [1, 2, 3, false] }, 'clean']
    ]
  };

  constructor() {}

  get isHopDong() { return this.title.toLowerCase().includes('hợp đồng'); }
  close() { this.onClose.emit(); }
  
  export() {
    this.isProcessing = true;
    this.onExport.emit(this.htmlContent);
  }

  copyKeyword(keyword: string) {
    navigator.clipboard.writeText(keyword).then(() => {});
  }

  insertTable() {
    const tableHtml = `<table style="width: 100%; border-collapse: collapse; border: 1px solid black;"><tr><td style="border: 1px solid black; padding: 5px;">Cột 1</td><td style="border: 1px solid black; padding: 5px;">Cột 2</td></tr><tr><td style="border: 1px solid black; padding: 5px;">Dòng 2</td><td style="border: 1px solid black; padding: 5px;">Dòng 2</td></tr></table><p><br></p>`;
    const quill = this.editorComponent.quillEditor;
    const range = quill.getSelection(true);
    quill.clipboard.dangerouslyPasteHTML(range.index, tableHtml, 'user');
  }

  initEditorContent(event: any) {
    if (this.htmlContent) {
      setTimeout(() => {
        event.clipboard.dangerouslyPasteHTML(0, this.htmlContent);
      }, 0);
    }
  }
}