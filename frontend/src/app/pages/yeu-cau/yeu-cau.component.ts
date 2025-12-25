import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, YeuCauChinhSua, ChiSoCongToGuiTuThue } from '../../services/api.service';

@Component({
    selector: 'app-yeu-cau',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="container-fluid">
      <div class="page-header">
        <h1><i class='bx bx-support text-gradient'></i> Yêu Cầu & Chỉ Số Online</h1>
      </div>

      <!-- Tabs -->
      <div class="d-flex mb-4 gap-3">
        <button class="btn" [class.btn-primary]="activeTab==='requests'" [class.btn-secondary]="activeTab!=='requests'" (click)="activeTab='requests'">
          <i class='bx bx-message-error'></i> Yêu cầu sửa chữa
          <span class="badge badge-danger" style="margin-left: 8px;" *ngIf="pendingRequestsCount > 0">{{ pendingRequestsCount }}</span>
        </button>
        <button class="btn" [class.btn-primary]="activeTab==='meters'" [class.btn-secondary]="activeTab!=='meters'" (click)="activeTab='meters'">
          <i class='bx bx-cloud-upload'></i> Chỉ số khách gửi
          <span class="badge badge-warning" style="margin-left: 8px;" *ngIf="pendingMetersCount > 0">{{ pendingMetersCount }}</span>
        </button>
      </div>

      <div class="card p-0">
        <div class="table-wrapper">
          
          <!-- Bảng Yêu Cầu -->
          <table class="table align-middle" *ngIf="activeTab === 'requests'">
            <thead>
              <tr>
                <th>Thời gian</th>
                <th>Phòng & Khách</th>
                <th>Nội dung yêu cầu</th>
                <th>Trạng thái</th>
                <th class="text-right">Xử lý</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of yeuCaus">
                <td style="min-width: 120px;">
                    <div style="font-weight: 500; color: var(--text-main);">{{ item.ngayTao | date:'dd/MM/yyyy' }}</div>
                    <div class="text-muted" style="font-size: 12px;">{{ item.ngayTao | date:'HH:mm' }}</div>
                </td>
                <td>
                    <div style="font-weight: 700; color: var(--text-main);">{{ getTenPhong(item.phongTroId) }}</div>
                    <small class="text-muted"><i class='bx bx-user'></i> {{ getTenKhach(item.khachThueId) }}</small>
                </td>
                <td>
                    <span class="badge badge-secondary mb-1">{{ item.loaiYeuCau }}</span>
                    <div style="font-weight: 500; color: var(--text-main);">{{ item.tieuDe }}</div>
                </td>
                <td>
                  <span class="badge" [ngClass]="getStatusClass(item.trangThai)">{{ item.trangThai }}</span>
                </td>
                <td class="text-right">
                  <button class="btn btn-sm btn-primary" (click)="openRequestModal(item)">
                    <i class='bx bx-detail'></i> Chi tiết
                  </button>
                </td>
              </tr>
              <tr *ngIf="yeuCaus.length === 0">
                 <td colspan="5" class="text-center text-muted p-4">Không có yêu cầu nào</td>
              </tr>
            </tbody>
          </table>

          <!-- Bảng Chỉ Số -->
          <table class="table align-middle" *ngIf="activeTab === 'meters'">
             <thead>
                <tr>
                    <th>Ngày gửi</th>
                    <th>Phòng</th>
                    <th>Loại & Chỉ số</th>
                    <th>Minh chứng</th>
                    <th>Trạng thái</th>
                    <th class="text-right">Hành động</th>
                </tr>
             </thead>
             <tbody>
                <tr *ngFor="let item of meters">
                    <td style="min-width: 120px;">
                        <div style="color: var(--text-main);">{{ item.ngayGui | date:'dd/MM/yyyy' }}</div>
                        <small class="text-muted">{{ item.ngayGui | date:'HH:mm' }}</small>
                    </td>
                    <td><strong style="color: var(--text-main);">{{ getTenPhong(item.phongTroId) }}</strong></td>
                    <td>
                        <span class="badge" [class.badge-warning]="item.loaiCongTo==='Điện'" [class.badge-info]="item.loaiCongTo==='Nước'">
                            {{ item.loaiCongTo }}
                        </span>
                        <strong style="margin-left: 8px; font-size: 16px; color: var(--primary);">{{ item.chiSo | number }}</strong>
                    </td>
                    <td>
                        <a *ngIf="item.anhCongTo" [href]="item.anhCongTo" target="_blank" class="btn-sm btn-outline text-muted" style="text-decoration: none;">
                            <i class='bx bx-image'></i> Xem ảnh
                        </a>
                        <span *ngIf="!item.anhCongTo" class="text-muted">-</span>
                    </td>
                    <td><span class="badge" [ngClass]="getStatusClass(item.trangThai)">{{ item.trangThai }}</span></td>
                    <td class="text-right">
                        <button class="btn btn-sm btn-action-success" 
                                *ngIf="item.trangThai === 'Chờ xác nhận'" 
                                (click)="openMeterConfirmModal(item)">
                            <i class='bx bx-check-circle'></i> Duyệt
                        </button>
                        <span *ngIf="item.trangThai !== 'Chờ xác nhận'" class="text-muted">
                            <i class='bx bx-check-double'></i> Đã xử lý
                        </span>
                    </td>
                </tr>
                <tr *ngIf="meters.length === 0">
                 <td colspan="6" class="text-center text-muted p-4">Không có chỉ số nào được gửi</td>
              </tr>
             </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Modal Xử Lý Yêu Cầu -->
    <div class="modal" *ngIf="showRequestModal" (click)="closeRequestModal($event)">
      <div class="modal-content">
        <div class="modal-header">
          <h3 class="modal-title">Chi Tiết Yêu Cầu</h3>
          <button class="close-btn" (click)="showRequestModal=false"><i class='bx bx-x'></i></button>
        </div>
        <div class="modal-body" *ngIf="selectedRequest">
          <div class="mb-3">
             <div class="d-flex justify-content-between mb-1">
                <span class="text-muted">Tiêu đề:</span>
                <strong style="color: var(--text-main);">{{ selectedRequest.tieuDe }}</strong>
             </div>
             <div class="d-flex justify-content-between">
                <span class="text-muted">Người gửi:</span>
                <span style="color: var(--text-main);">{{ getTenKhach(selectedRequest.khachThueId) }} ({{ getTenPhong(selectedRequest.phongTroId) }})</span>
             </div>
          </div>

          <div class="form-group">
             <label class="form-label">Nội dung yêu cầu:</label>
             <div class="card p-3" style="background: var(--bg-input); border: none; color: var(--text-main);">
                {{ selectedRequest.noiDung }}
             </div>
          </div>

          <div class="form-group" *ngIf="selectedRequest.anhMinhHoa">
             <label class="form-label">Ảnh đính kèm:</label>
             <img [src]="selectedRequest.anhMinhHoa" style="width: 100%; border-radius: 8px; max-height: 300px; object-fit: contain; background: #000;">
          </div>
          
          <hr style="border-color: var(--border); margin: 20px 0;">
          
          <div class="form-group">
            <label class="form-label">Phản hồi của chủ trọ:</label>
            <textarea class="form-control" rows="3" [(ngModel)]="requestResponse.phanHoi" placeholder="Nhập câu trả lời..."></textarea>
          </div>
          <div class="form-group">
            <label class="form-label">Trạng thái:</label>
            <select class="form-control" [(ngModel)]="requestResponse.trangThai">
              <option value="Đang xử lý">Đang xử lý</option>
              <option value="Hoàn thành">Hoàn thành</option>
              <option value="Từ chối">Từ chối</option>
            </select>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" (click)="showRequestModal=false">Đóng</button>
          <button class="btn btn-primary" (click)="submitRequestResponse()">Cập nhật</button>
        </div>
      </div>
    </div>

    <!-- MODAL DUYỆT CHỈ SỐ -->
    <div class="modal" *ngIf="showMeterModal" (click)="closeMeterModal($event)">
      <div class="modal-content" style="max-width: 950px; padding: 40px;">
        <div class="modal-header" style="margin-bottom: 30px;">
          <h3 class="modal-title" style="font-size: 22px; color: var(--text-main);">Xác Nhận & Tạo Chỉ Số</h3>
          <button class="close-btn" (click)="showMeterModal=false"><i class='bx bx-x'></i></button>
        </div>
        
        <div class="modal-body" *ngIf="selectedMeter" style="display: grid; grid-template-columns: 1fr 1fr; gap: 60px; align-items: start;">
           
           <!-- CỘT TRÁI: THÔNG TIN -->
           <div style="border-right: 1px solid var(--border); padding-right: 30px;">
              <h4 class="section-label">THÔNG TIN KHÁCH GỬI</h4>
              
              <div class="mb-5">
                 <label class="data-label">Phòng trọ</label>
                 <div class="data-value-lg">{{ getTenPhong(selectedMeter.phongTroId) }}</div>
              </div>
              
              <div class="d-flex gap-5 mb-5">
                  <div style="flex: 1;">
                     <label class="data-label">Loại chỉ số</label>
                     <span class="badge" 
                           style="padding: 8px 12px; font-size: 14px;"
                           [class.badge-warning]="selectedMeter.loaiCongTo==='Điện'" 
                           [class.badge-info]="selectedMeter.loaiCongTo==='Nước'">
                           {{ selectedMeter.loaiCongTo }}
                     </span>
                  </div>
                  <div style="flex: 1;">
                     <label class="data-label">Kỳ ghi</label>
                     <span class="data-value-md">{{ selectedMeter.thangNam | date:'MM/yyyy' }}</span>
                  </div>
              </div>

              <!-- Box Chỉ số mới -->
              <div class="info-box mb-4">
                 <label class="data-label">Chỉ số MỚI (Khách nhập)</label>
                 <div class="data-highlight">{{ selectedMeter.chiSo | number }}</div>
              </div>

              <div *ngIf="selectedMeter.anhCongTo">
                  <label class="data-label">Ảnh minh chứng:</label>
                  <img [src]="selectedMeter.anhCongTo" style="width: 100%; max-height: 200px; object-fit: contain; border-radius: 12px; border: 1px solid var(--border); background: #000;">
              </div>
           </div>

           <!-- CỘT PHẢI: XỬ LÝ -->
           <div style="display: flex; flex-direction: column; justify-content: center; height: 100%;">
              <h4 class="section-label">XỬ LÝ CỦA CHỦ TRỌ</h4>

              <div class="form-group mb-5">
                 <label class="form-label" style="font-size: 15px; margin-bottom: 12px; display: block;">Nhập chỉ số CŨ (Tháng trước)</label>
                 <input type="number" class="form-control big-input" [(ngModel)]="meterConfirmData.chiSoCu" (change)="calculateUsage()" placeholder="0">
                 <small class="text-muted mt-2 d-block"><i class='bx bx-info-circle'></i> Hệ thống tự động trừ để tính tiêu thụ.</small>
              </div>

              <div class="result-box p-4 rounded mt-2 mb-5" [ngClass]="meterConfirmData.soTieuThu >= 0 ? 'bg-success-light' : 'bg-danger-light'">
                 <div class="d-flex justify-content-between align-items-center">
                    <span style="font-weight: 600; font-size: 16px; color: var(--text-main);">Số tiêu thụ:</span>
                    <strong style="font-size: 32px;" [style.color]="meterConfirmData.soTieuThu >= 0 ? '#10b981' : '#ef4444'">{{ meterConfirmData.soTieuThu | number }}</strong>
                 </div>
                 <div *ngIf="meterConfirmData.soTieuThu < 0" class="text-danger mt-2 text-sm font-bold">
                    <i class='bx bx-error'></i> Lỗi: Chỉ số mới nhỏ hơn cũ!
                 </div>
              </div>
              
              <div class="mt-auto d-grid">
                 <button class="btn btn-action-success w-100 btn-lg mb-4" (click)="confirmMeter()" [disabled]="meterConfirmData.soTieuThu < 0">
                    <i class='bx bx-check-circle'></i> Duyệt & Lưu Chỉ Số
                 </button>
                 
                 <button class="btn btn-action-danger w-100" (click)="rejectMeter()">
                    <i class='bx bx-x-circle'></i> Từ chối
                 </button>

              </div>
           </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .btn-action-success {
        background-color: #10b981 !important; 
        color: #ffffff !important;
        padding: 8px; 
        font-size: 12px;
        border: none;
        border-radius: 8px;
        font-weight: 600;
        transition: 0.2s;
    }
    .btn-action-success:hover:not(:disabled) {
        background-color: #059669 !important;
        transform: translateY(-2px);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
    }
    .btn-action-success:disabled {
        background-color: #d1d5db !important;
        color: #9ca3af !important;
        cursor: not-allowed;
        transform: none;
        box-shadow: none;
    }

    .btn-action-danger {
        background-color: transparent !important;
        border: 1px solid #ef4444 !important;
        color: #ef4444 !important;
        padding: 12px;
        font-weight: 600;
        border-radius: 8px;
        transition: 0.2s;
    }
    .btn-action-danger:hover {
        background-color: rgba(239, 68, 68, 0.1) !important;
    }

    .section-label { color: var(--text-muted); font-size: 12px; text-transform: uppercase; font-weight: 700; letter-spacing: 1px; margin-bottom: 16px; }
    .data-label { color: var(--text-muted); font-size: 13px; display: block; margin-bottom: 6px; }
    .data-value-lg { font-size: 24px; font-weight: 700; color: var(--text-main); }
    .data-value-md { font-size: 16px; font-weight: 600; color: var(--text-main); }
    .data-highlight { font-size: 36px; font-weight: 800; color: var(--primary); line-height: 1; }

    .info-box { background: var(--bg-input); border: 1px solid var(--border); border-radius: 12px; padding: 20px; }
    .big-input { font-size: 20px; font-weight: 600; padding: 16px; }

    .bg-success-light { background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3); }
    .bg-danger-light { background: rgba(239,68,68,0.1); border: 1px solid rgba(239,68,68,0.3); }

    .d-grid { display: grid; }
    .text-sm { font-size: 12px; }

    @media (max-width: 900px) {
        .modal-body { grid-template-columns: 1fr !important; gap: 40px !important; }
        .modal-body > div:first-child { border-right: none !important; border-bottom: 1px solid var(--border); padding-bottom: 30px; padding-right: 0 !important; }
    }
  `]
})
export class YeuCauComponent implements OnInit {
    activeTab = 'requests'; yeuCaus: any[]=[]; meters: any[]=[]; phongTroMap: any={}; khachThueMap: any={};
    showRequestModal=false; selectedRequest:any; requestResponse={phanHoi:'', trangThai:'Đang xử lý'};
    showMeterModal=false; selectedMeter:any; meterConfirmData={chiSoCu:0, soTieuThu:0};

    constructor(private apiService: ApiService) {}
    ngOnInit() { this.loadMetadata(); this.loadData(); }
    loadMetadata() { this.apiService.getPhongTros().subscribe(d=>d.forEach(p=>this.phongTroMap[p.id]=p.soPhong)); this.apiService.getKhachThues().subscribe(d=>d.forEach(k=>this.khachThueMap[k.id]=k.hoTen)); }
    loadData() { this.apiService.getAllYeuCaus().subscribe(d=>this.yeuCaus=d); this.apiService.getAllSubmittedMeterReadings().subscribe(d=>this.meters=d); }
    get pendingRequestsCount() { return this.yeuCaus.filter(x=>x.trangThai==='Chờ xử lý').length; }
    get pendingMetersCount() { return this.meters.filter(x=>x.trangThai==='Chờ xác nhận').length; }
    getTenPhong(id:number) { return this.phongTroMap[id]||id; } getTenKhach(id:number) { return this.khachThueMap[id]||id; }
    getStatusClass(s:string) { return s==='Chờ xử lý'?'badge-warning':(s==='Hoàn thành'?'badge-success':'badge-info'); }
    
    openRequestModal(i:any) { this.selectedRequest=i; this.showRequestModal=true; }
    closeRequestModal(e:any) { if(!e||e.target===e.currentTarget) this.showRequestModal=false; }
    submitRequestResponse() { this.apiService.respondToYeuCau(this.selectedRequest.id, this.requestResponse).subscribe(()=>{alert('Xong'); this.showRequestModal=false; this.loadData();}); }
    
    openMeterConfirmModal(i:any) { 
        this.selectedMeter=i; this.showMeterModal=true; 
        if(i.phongTroId && i.loaiCongTo) this.apiService.getGoiYChiSo(i.phongTroId, i.loaiCongTo).subscribe(r=>this.meterConfirmData={chiSoCu:r.chiSoCu||0, soTieuThu:i.chiSo-(r.chiSoCu||0)});
    }
    closeMeterModal(e:any) { if(!e||e.target===e.currentTarget) this.showMeterModal=false; }
    calculateUsage() { if(this.selectedMeter) this.meterConfirmData.soTieuThu = this.selectedMeter.chiSo - this.meterConfirmData.chiSoCu; }
    confirmMeter() { this.apiService.confirmMeterReading(this.selectedMeter.id, this.meterConfirmData.chiSoCu).subscribe(()=>{alert('Xong'); this.showMeterModal=false; this.loadData();}); }
    rejectMeter() { const r=prompt('Lý do?'); if(r) this.apiService.rejectMeterReading(this.selectedMeter.id, r).subscribe(()=>{alert('Đã từ chối'); this.showMeterModal=false; this.loadData();}); }
}