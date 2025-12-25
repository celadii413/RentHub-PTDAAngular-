import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService, PhongTro, HoaDon, ChiSoCongTo, HopDong, YeuCauChinhSua, ChiSoCongToGuiTuThue, ThongBao } from '../../services/api.service';

@Component({
  selector: 'app-tenant-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container" style="max-width: 1200px;">
      
      <!-- 1. TỔNG QUAN -->
      <div *ngIf="currentView === 'overview'" class="fade-in">
         <div class="page-header">
            <h1><i class='bx bx-home-smile text-gradient'></i> Tổng quan phòng trọ</h1>
         </div>
         
         <div class="grid-layout">
            <!-- Card Thông tin -->
            <div class="card info-card">
               <div class="card-bg-icon"><i class='bx bx-home'></i></div>
               <h3 class="mb-4 text-white">Thông tin phòng của bạn</h3>
               <div *ngIf="room; else noRoom" class="room-details">
                  <div class="detail-row">
                     <span class="lbl"><i class='bx bx-map'></i> Dãy trọ</span>
                     <span class="val">{{ room.tenDayTro }}</span>
                  </div>
                  <div class="detail-row">
                     <span class="lbl"><i class='bx bx-door-open'></i> Số phòng</span>
                     <span class="val text-highlight">{{ room.soPhong }}</span>
                  </div>
                  <div class="detail-row">
                     <span class="lbl"><i class='bx bx-money'></i> Giá thuê</span>
                     <span class="val">{{ room.giaThue | number }} đ</span>
                  </div>
                  <div class="detail-row">
                     <span class="lbl"><i class='bx bx-wallet'></i> Tiền cọc</span>
                     <span class="val">{{ room.tienCoc | number }} đ</span>
                  </div>
               </div>
               <ng-template #noRoom><div class="alert alert-warning">Chưa có thông tin phòng</div></ng-template>
            </div>

            <!-- Card Hợp Đồng -->
            <div class="card">
               <h3 class="mb-4"><i class='bx bx-file'></i> Hợp đồng thuê</h3>
               <div *ngIf="contracts.length === 0" class="text-muted">Chưa có hợp đồng</div>
               <div *ngFor="let c of contracts" class="contract-card">
                  <div class="icon"><i class='bx bxs-file-pdf'></i></div>
                  <div class="info">
                     <div class="code">Mã: {{ c.maHopDong }}</div>
                     <div class="date">{{ c.ngayBatDau | date:'dd/MM/yyyy' }} - {{ c.ngayKetThuc | date:'dd/MM/yyyy' }}</div>
                  </div>
                  <!-- Nút đồng bộ -->
                  <button class="btn btn-outline btn-sm" (click)="downloadContract(c.id)">
                      <i class='bx bx-download'></i> Tải về
                  </button>
               </div>
            </div>
         </div>
      </div>

      <!-- 2. HÓA ĐƠN (Đã đồng bộ nút bấm) -->
      <div *ngIf="currentView === 'billing'" class="fade-in">
         <div class="page-header">
            <h1><i class='bx bx-receipt text-gradient'></i> Hóa đơn & Thanh toán</h1>
         </div>
         <div class="card p-0">
            <div class="table-wrapper">
               <table class="table align-middle">
                  <thead>
                    <tr>
                        <th>Tháng/Năm</th>
                        <th>Chi tiết phí</th>
                        <th>Tổng tiền</th>
                        <th>Trạng thái</th>
                        <th class="text-right">Hành động</th>
                    </tr>
                  </thead>
                  <tbody>
                     <tr *ngFor="let h of invoices">
                        <td><strong>{{ h.thangNam | date:'MM/yyyy' }}</strong></td>
                        <td>
                            <div class="text-muted text-sm">
                                Điện: {{h.tienDien|number}}, Nước: {{h.tienNuoc|number}}
                            </div>
                        </td>
                        <td><strong class="text-primary">{{ h.tongTien | number }} đ</strong></td>
                        <td>
                            <span class="badge" [ngClass]="getStatusClass(h.trangThai)">{{ h.trangThai }}</span>
                        </td>
                        <td class="text-right">
                           <div class="d-flex justify-content-end gap-2">
                               <!-- Nút Tải PDF -->
                               <button class="btn btn-outline btn-sm" (click)="downloadInvoice(h.id)" title="Tải hóa đơn">
                                  <i class='bx bxs-file-pdf'></i> PDF
                               </button>

                               <!-- Nút Thanh toán -->
                               <button class="btn btn-primary btn-sm" (click)="openPaymentModal(h)">
                                  <i class='bx bx-credit-card'></i> Thanh toán
                               </button>
                           </div>
                        </td>
                     </tr>
                     <tr *ngIf="invoices.length===0">
                        <td colspan="5" class="text-center text-muted p-4">Chưa có hóa đơn nào</td>
                     </tr>
                  </tbody>
               </table>
            </div>
         </div>
      </div>

      <!-- 3. YÊU CẦU & CHỈ SỐ -->
      <div *ngIf="currentView === 'requests'" class="fade-in">
         <div class="page-header">
            <h1><i class='bx bx-support text-gradient'></i> Yêu cầu & Chỉ số</h1>
         </div>
         <div class="grid-layout">
            <!-- Form Yêu Cầu -->
            <div class="card">
               <h3 class="mb-4">Gửi yêu cầu hỗ trợ</h3>
               <form (ngSubmit)="submitRequest()">
                  <div class="form-group">
                     <label class="form-label">Loại yêu cầu</label>
                     <select class="form-control" [(ngModel)]="requestForm.loaiYeuCau" name="loai">
                        <option value="Sửa chữa">Sửa chữa thiết bị</option>
                        <option value="An ninh">Vấn đề an ninh</option>
                        <option value="Khác">Khác</option>
                     </select>
                  </div>
                  <div class="form-group">
                     <label class="form-label">Tiêu đề</label>
                     <input class="form-control" [(ngModel)]="requestForm.tieuDe" name="td" required placeholder="Ví dụ: Bóng đèn hỏng...">
                  </div>
                  <div class="form-group">
                     <label class="form-label">Nội dung</label>
                     <textarea class="form-control" [(ngModel)]="requestForm.noiDung" name="nd" rows="3" required></textarea>
                  </div>
                  
                  <div class="form-group">
                      <label class="form-label">Hình ảnh đính kèm (Tùy chọn)</label>
                      <input type="file" class="form-control" (change)="onRequestFileSelect($event)">
                  </div>

                  <button class="btn btn-primary w-100" type="submit" [disabled]="requestSubmitting">
                     <i class='bx bx-send'></i> {{ requestSubmitting ? 'Đang gửi...' : 'Gửi yêu cầu' }}
                  </button>
               </form>
            </div>

            <!-- Form Chỉ Số -->
            <div class="card">
               <h3 class="mb-4">Gửi chỉ số Điện/Nước</h3>
               <form (ngSubmit)="submitMeter()">
                  <div class="d-flex gap-3">
                     <div class="form-group w-100">
                        <label class="form-label">Loại công tơ</label>
                        <select class="form-control" [(ngModel)]="meterForm.loaiCongTo" name="loaiM">
                           <option value="Điện">Điện</option>
                           <option value="Nước">Nước</option>
                        </select>
                     </div>
                     <div class="form-group w-100">
                        <label class="form-label">Chỉ số mới</label>
                        <input type="number" class="form-control" [(ngModel)]="meterForm.chiSo" name="cs" required>
                     </div>
                  </div>
                  <div class="form-group">
                     <label class="form-label">Tháng ghi sổ</label>
                     <input type="month" class="form-control" [(ngModel)]="meterForm.thangNam" name="tnM" required>
                  </div>
                  <div class="form-group">
                     <label class="form-label">Ảnh đồng hồ (Tùy chọn)</label>
                     <input type="file" class="form-control" (change)="onMeterFileSelect($event)">
                  </div>
                  <button class="btn btn-success w-100" type="submit" [disabled]="meterSubmitting">
                      <i class='bx bx-paper-plane'></i> {{ meterSubmitting ? 'Đang gửi...' : 'Gửi chỉ số' }}
                  </button>
               </form>
            </div>
         </div>
      </div>

      <!-- 4. THÔNG BÁO -->
      <div *ngIf="currentView === 'notifications'" class="fade-in">
         <div class="page-header">
            <h1><i class='bx bx-bell text-gradient'></i> Thông báo mới nhất</h1>
         </div>
         <div class="card p-0">
            <div class="notif-list">
               <div *ngIf="notifications.length===0" class="p-5 text-center text-muted">Bạn không có thông báo nào</div>
               <div *ngFor="let n of notifications" class="notif-item">
                  <div class="notif-icon"><i class='bx bx-envelope'></i></div>
                  <div class="notif-content">
                     <div class="d-flex justify-content-between mb-1">
                        <strong>{{n.tieuDe}}</strong>
                        <span class="text-muted text-sm">{{n.ngayTao | date:'dd/MM HH:mm'}}</span>
                     </div>
                     <p>{{n.noiDung}}</p>
                  </div>
               </div>
            </div>
         </div>
      </div>

    </div>
    
    <!-- Payment Modal -->
    <div class="modal" *ngIf="showPaymentModal" (click)="closePaymentModal($event)">
       <div class="modal-content text-center">
          <div class="modal-header">
             <h3 class="modal-title">Thanh toán</h3>
             <button class="close-btn" (click)="showPaymentModal=false"><i class='bx bx-x'></i></button>
          </div>
          <p class="mb-3">Quét mã VietQR để thanh toán nhanh:</p>
          <img [src]="qrUrl" *ngIf="qrUrl" style="max-width: 100%; border-radius: 12px; margin-bottom: 20px; border: 1px solid var(--border); box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
          <div *ngIf="!qrUrl" class="alert alert-warning mb-3">Chủ trọ chưa cài đặt thông tin ngân hàng.</div>
          
          <div class="text-left">
             <label class="form-label">Gửi ảnh xác nhận giao dịch:</label>
             <input type="file" (change)="onProofFileSelect($event)" class="form-control mb-3">
          </div>
          
          <div class="modal-footer">
             <button class="btn btn-secondary" (click)="showPaymentModal=false">Đóng</button>
             <button class="btn btn-primary" (click)="submitProof()" [disabled]="!proofFile">
                <i class='bx bx-check'></i> Gửi xác nhận
             </button>
          </div>
       </div>
    </div>
  `,
  styles: [`
    .grid-layout { display: grid; grid-template-columns: 1fr 1fr; gap: 30px; }
    @media(max-width: 768px) { .grid-layout { grid-template-columns: 1fr; } }
    .info-card { background: linear-gradient(135deg, #4f46e5, #3b82f6); color: white; position: relative; overflow: hidden; border: none; }
    .card-bg-icon { position: absolute; right: -20px; top: -20px; font-size: 150px; opacity: 0.1; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid rgba(255,255,255,0.1); }
    .text-highlight { color: #facc15; font-size: 20px; font-weight: 700; }
    
    .contract-card { background: var(--bg-body); padding: 16px; border-radius: 12px; border: 1px solid var(--border); display: flex; align-items: center; gap: 16px; margin-bottom: 12px; transition: 0.2s; }
    .contract-card:hover { border-color: var(--primary); }
    .contract-card .icon { width: 40px; height: 40px; background: rgba(239,68,68,0.1); color: #ef4444; border-radius: 8px; display: flex; align-items: center; justify-content: center; font-size: 24px; }
    
    .notif-item { padding: 20px; border-bottom: 1px solid var(--border); display: flex; gap: 20px; transition: 0.2s; }
    .notif-item:hover { background: var(--bg-body); }
    .notif-icon { width: 48px; height: 48px; background: var(--bg-input); border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 24px; color: var(--primary); }
    .notif-content { flex: 1; }
    
    .fade-in { animation: fadeIn 0.4s ease-out; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
    
    .gap-2 { gap: 8px; }
    .justify-content-end { justify-content: flex-end; }
    .alert-warning { background: rgba(245,158,11,0.1); color: #b45309; padding: 10px; border-radius: 8px; }
  `]
})
export class TenantDashboardComponent implements OnInit {
  currentView = 'overview';
  room: any; invoices: any[]=[]; contracts: any[]=[]; requests: any[]=[]; submittedMeters: any[]=[]; notifications: any[]=[];

  requestForm = { loaiYeuCau: 'Sửa chữa', tieuDe: '', noiDung: '' };
  meterForm = { loaiCongTo: 'Điện', chiSo: 0, thangNam: new Date().toISOString().slice(0, 7) };
  
  requestSubmitting=false; meterSubmitting=false; showPaymentModal=false; selectedInvoice:any; qrUrl=''; proofFile:any; requestFile: File | null = null; meterFile: File | null = null;

  constructor(private api: ApiService, private route: ActivatedRoute) {}
  
  ngOnInit() {
    this.route.queryParams.subscribe(p => this.currentView = p['view'] || 'overview');
    this.loadAllData();
  }

  loadAllData() {
    this.api.getMyRoom().subscribe({next: r=>this.room=r, error:()=>this.room=null});
    this.api.getMyInvoices().subscribe(r=>this.invoices=r);
    this.api.getMyContracts().subscribe(r=>this.contracts=r);
    this.api.getMyYeuCauChinhSuas().subscribe(r=>this.requests=r);
    this.api.getMySubmittedMeterReadings().subscribe(r=>this.submittedMeters=r);
    this.api.getTenantNotifications().subscribe(r=>this.notifications=r);
  }

  submitRequest() {
     if(!this.room) return; this.requestSubmitting = true;
     const send = (url?: string) => {
        this.api.createYeuCauChinhSua({ ...this.requestForm, phongTroId: this.room.id, anhMinhHoa: url }).subscribe({
            next: () => { this.requestSubmitting = false; alert('Gửi yêu cầu thành công!'); this.loadAllData(); },
            error: (err) => { this.requestSubmitting = false; alert('Lỗi: ' + (err.error?.message || 'Không thể gửi yêu cầu')); }
        });
     };
     if(this.requestFile) this.api.uploadEditRequestImage(this.requestFile).subscribe(res => send(res.fileUrl));
     else send();
  }

  submitMeter() {
     if(!this.room) return; 
     if(!this.meterForm.thangNam) { alert('Vui lòng chọn tháng ghi sổ'); return; }
     
     this.meterSubmitting = true;
     const send = (url?: string) => {
        const payload = {
            ...this.meterForm,
            thangNam: this.meterForm.thangNam + '-01', 
            phongTroId: this.room.id,
            anhCongTo: url
        };
        this.api.submitMeterReading(payload).subscribe({
            next: () => { this.meterSubmitting = false; alert('Gửi chỉ số thành công!'); this.loadAllData(); },
            error: (err) => { this.meterSubmitting = false; alert('Lỗi: ' + (err.error?.message || 'Không thể gửi chỉ số')); }
        });
     };
     if(this.meterFile) this.api.uploadMeterReadingImage(this.meterFile).subscribe(res => send(res.fileUrl));
     else send();
  }

  onRequestFileSelect(e: any) { this.requestFile = e.target.files[0]; }
  onMeterFileSelect(e: any) { this.meterFile = e.target.files[0]; }
  
  openPaymentModal(h: any) { 
      this.selectedInvoice = h; this.showPaymentModal = true;
      if (h.chuTro_TenNganHang && h.chuTro_SoTaiKhoan) {
        this.qrUrl = `https://img.vietqr.io/image/${h.chuTro_TenNganHang}-${h.chuTro_SoTaiKhoan}-compact2.png?amount=${h.tongTien}&addInfo=Thanh toan HD ${h.maHoaDon}`;
      } else { this.qrUrl = ''; }
  }
  closePaymentModal(e: any) { if(!e || e.target === e.currentTarget) this.showPaymentModal = false; }
  onProofFileSelect(e: any) { this.proofFile = e.target.files[0]; }
  submitProof() {
    if(this.proofFile && this.selectedInvoice) {
        this.api.uploadImage(this.proofFile, 'proofs').subscribe(res => {
            this.api.submitPaymentProof(this.selectedInvoice!.id, res.fileUrl).subscribe(() => {
                alert('Đã gửi ảnh xác nhận!'); this.showPaymentModal = false;
            });
        });
    }
  }
  
  downloadContract(id: any) { 
      this.api.downloadContractPdf(id).subscribe(blob => { 
          const url = window.URL.createObjectURL(blob); 
          const link = document.createElement('a');
          link.href = url;
          link.download = `HopDong_${id}.pdf`;
          link.click();
      }); 
  }

  downloadInvoice(id: any) {
      this.api.downloadInvoicePdf(id).subscribe(blob => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `HoaDon_${id}.pdf`;
          link.click();
      });
  }

  getStatusClass(s: string) { return s === 'Đã thanh toán' ? 'badge-success' : 'badge-warning'; }
}