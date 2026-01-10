import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ApiService, PhongTro, HoaDon, ChiSoCongTo, HopDong, YeuCauChinhSua, ChiSoCongToGuiTuThue, ThongBao } from '../../services/api.service';
import { ToastService } from '../../services/toast.service';

@Component({
    selector: 'app-tenant-dashboard',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './tenant-dashboard.component.html',
    styleUrls: ['./tenant-dashboard.component.css']
})
export class TenantDashboardComponent implements OnInit {
    currentView = 'overview';
    room: any; invoices: any[] = []; contracts: any[] = []; requests: any[] = []; submittedMeters: any[] = []; notifications: any[] = [];

    requestForm = { loaiYeuCau: 'Sửa chữa', tieuDe: '', noiDung: '' };
    meterForm = { loaiCongTo: 'Điện', chiSo: 0, thangNam: new Date().toISOString().slice(0, 7) };

    requestSubmitting = false; meterSubmitting = false; showPaymentModal = false; selectedInvoice: any; qrUrl = ''; proofFile: any; requestFile: File | null = null; meterFile: File | null = null;

    constructor(private api: ApiService, private route: ActivatedRoute, private toastService: ToastService) { }

    ngOnInit() {
        this.route.queryParams.subscribe(p => this.currentView = p['view'] || 'overview');
        this.loadAllData();
    }

    loadAllData() {
        this.api.getMyRoom().subscribe({ next: r => this.room = r, error: () => this.room = null });
        this.api.getMyInvoices().subscribe(r => this.invoices = r);
        this.api.getMyContracts().subscribe(r => this.contracts = r);
        this.api.getMyYeuCauChinhSuas().subscribe(r => this.requests = r);
        this.api.getMySubmittedMeterReadings().subscribe(r => this.submittedMeters = r);
        this.api.getTenantNotifications().subscribe(r => this.notifications = r);
    }

    submitRequest() {
        if (!this.room) return; this.requestSubmitting = true;
        const send = (url?: string) => {
            this.api.createYeuCauChinhSua({ ...this.requestForm, phongTroId: this.room.id, anhMinhHoa: url }).subscribe({
                next: () => {
                    this.requestSubmitting = false;
                    this.toastService.success('Gửi yêu cầu thành công! Chủ nhà sẽ sớm phản hồi.');
                    this.requestForm = { loaiYeuCau: 'Sửa chữa', tieuDe: '', noiDung: '' };
                    this.loadAllData();
                },
                error: (err) => {
                    this.requestSubmitting = false;
                    this.toastService.error('Lỗi: ' + (err.error?.message || 'Không thể gửi yêu cầu'));
                }
            });
        };
        if (this.requestFile) this.api.uploadEditRequestImage(this.requestFile).subscribe(res => send(res.fileUrl));
        else send();
    }

    submitMeter() {
        if (!this.room) return;
        if (!this.meterForm.thangNam) { this.toastService.warning('Vui lòng chọn tháng ghi sổ'); return; }

        this.meterSubmitting = true;
        const send = (url?: string) => {
            const payload = { ...this.meterForm, thangNam: this.meterForm.thangNam + '-01', phongTroId: this.room.id, anhCongTo: url };
            this.api.submitMeterReading(payload).subscribe({
                next: () => {
                    this.meterSubmitting = false;
                    this.toastService.success('Gửi chỉ số thành công!');
                    this.loadAllData();
                },
                error: (err) => {
                    this.meterSubmitting = false;
                    this.toastService.error('Lỗi: ' + (err.error?.message || 'Không thể gửi chỉ số'));
                }
            });
        };
        if (this.meterFile) this.api.uploadMeterReadingImage(this.meterFile).subscribe(res => send(res.fileUrl));
        else send();
    }

    onRequestFileSelect(e: any) { this.requestFile = e.target.files[0]; }
    onMeterFileSelect(e: any) { this.meterFile = e.target.files[0]; }

    openPaymentModal(h: any) {
        this.selectedInvoice = h; this.showPaymentModal = true;
        if (h.chuTro_TenNganHang && h.chuTro_SoTaiKhoan) {
            this.qrUrl = `https://img.vietqr.io/image/${h.chuTro_TenNganHang}-${h.chuTro_SoTaiKhoan}-compact2.png?amount=${h.tongTien}&addInfo=Thanh toan HD ${h.maHoaDon}`;
        }
        else {
            this.qrUrl = '';
        }
    }
    closePaymentModal(e: any) { if (!e || e.target === e.currentTarget) this.showPaymentModal = false; }
    onProofFileSelect(e: any) { this.proofFile = e.target.files[0]; }
    submitProof() {
        if (this.proofFile && this.selectedInvoice) {
            this.api.uploadImage(this.proofFile, 'proofs').subscribe({
                next: (res) => {
                    this.api.submitPaymentProof(this.selectedInvoice!.id, res.fileUrl).subscribe(() => {
                        this.toastService.success('Đã gửi ảnh xác nhận thanh toán!');
                        this.showPaymentModal = false;
                        this.loadAllData();
                    });
                },
                error: () => this.toastService.error('Lỗi tải ảnh lên')
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