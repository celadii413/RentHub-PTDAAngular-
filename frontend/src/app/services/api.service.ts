import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../environments/environment';

export interface DayTro {
  id: number;
  tenDayTro: string;
  diaChi: string;
  soTang: number;
  soPhongMoiTang: number;
  moTa: string;
  ngayTao: string;
  tongSoPhong: number;
  tongDienThangNay?: number;
  tongNuocThangNay?: number;
}

export interface PhongTro {
  id: number;
  soPhong: string;
  tenPhong: string;
  tang: number;
  giaThue: number;
  tienCoc: number;
  dienTich: number;
  moTa: string;
  trangThai: string;
  dayTroId: number;
  tenDayTro?: string;
  ngayTao: string;
  soKhachThue: number;
  hinhAnh1?: string;
  hinhAnh2?: string;
  hinhAnh3?: string;
  gioiHanSoNguoi: number;
  chiSoDienMoiNhat?: number;
  chiSoNuocMoiNhat?: number;
}

export interface User {
  id: number;
  username: string;
  email: string;
  hoTen: string;
  soDienThoai: string;
  vaiTro: string;
  dayTroId?: number;

  tenNganHang?: string;
  soTaiKhoan?: string;
  tenTaiKhoan?: string;
}

export interface KhachThue {
  id: number;
  hoTen: string;
  soDienThoai: string;
  email: string;
  cccd: string;
  ngaySinh: string;
  gioiTinh: string;
  diaChiThuongTru: string;
  ngayBatDauThue: string;
  ngayKetThucThue?: string;
  phongTroId: number;
  soPhong?: string;
  laKhachChinh: boolean;
  anhCCCDMatTruoc?: string;
  anhCCCDMatSau?: string;
}

export interface HopDong {
  id: number;
  maHopDong: string;
  phongTroId: number;
  soPhong?: string;
  khachThueId: number;
  tenKhachThue?: string;
  ngayBatDau: string;
  ngayKetThuc: string;
  giaThue: number;
  tienCoc: number;
  trangThai: string;
  ghiChu?: string;
  fileHopDong?: string;
  ngayTao: string;
}

export interface DichVu {
  id: number;
  tenDichVu: string;
  donViTinh: string;
  giaMacDinh: number;
  loaiGia: string;
  dayTroId?: number;
  tenDayTro?: string;
  phongTroId?: number;
  soPhong?: string;
  isActive: boolean;
  ngayTao: string;
}

export interface ChiSoCongTo {
  id: number;
  phongTroId: number;
  soPhong?: string;
  loaiCongTo: string;
  chiSoCu: number;
  chiSoMoi: number;
  soTieuThu: number;
  thangNam: string;
  ngayGhi: string;
  ghiChu?: string;
}

export interface HoaDon {
  id: number;
  maHoaDon: string;
  phongTroId: number;
  soPhong?: string;
  thangNam: string;
  tienPhong: number;
  tienDien: number;
  tienNuoc: number;
  tienInternet: number;
  tienVeSinh: number;
  congNoThangTruoc: number;
  tongTien: number;
  trangThai: string;
  ngayThanhToan?: string;
  phuongThucThanhToan?: string;
  ngayTao: string;
  ghiChu: string;
  anhMinhChung?: string;
  chuTro_TenNganHang?: string;
  chuTro_SoTaiKhoan?: string;
  chuTro_TenTaiKhoan?: string;
}

export interface ThongKe {
  tongSoPhong: number;
  phongTrong: number;
  phongDaThue: number;
  phongDangSua: number;
  doanhThuThang: number;
  tongCongNo: number;
  hoaDonChuaThanhToan: number;
  tongChiPhiThang: number; 
}

export interface DoanhThuThang {
  thang: number;
  nam: number;
  doanhThu: number;
}

// Tenant-specific DTOs
export interface YeuCauChinhSua {
  id: number;
  khachThueId: number;
  phongTroId: number;
  loaiYeuCau: string;
  tieuDe: string;
  noiDung: string;
  anhMinhHoa?: string;
  trangThai: string;
  phanHoi?: string;
  ngayTao: string;
  ngayXuLy?: string;
}

export interface ChiSoCongToGuiTuThue {
  id: number;
  phongTroId: number;
  loaiCongTo: string;
  chiSo: number;
  thangNam: string;
  anhCongTo?: string;
  trangThai: string;
  ghiChu?: string;
  ngayGui: string;
  ngayXacNhan?: string;
}

export interface ThongBao {
  id: number;
  tieuDe: string;
  noiDung: string;
  dayTroId?: number | null;
  phongTroId?: number | null;
  ngayTao: string;
  daDoc: boolean;
}

export interface ChiPhi {
  id: number;
  tenChiPhi: string;
  soTien: number;
  loaiChiPhi: string;
  ngayChi: string;
  ghiChu: string;
  dayTroId: number | null;
  tenDayTro: string;
}

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  private baseUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getDayTros(): Observable<DayTro[]> {
    return this.http.get<DayTro[]>(`${this.baseUrl}/DayTro`);
  }

  getDayTro(id: number): Observable<DayTro> {
    return this.http.get<DayTro>(`${this.baseUrl}/DayTro/${id}`);
  }

  createDayTro(data: any): Observable<DayTro> {
    return this.http.post<DayTro>(`${this.baseUrl}/DayTro`, data);
  }

  updateDayTro(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/DayTro/${id}`, data);
  }

  deleteDayTro(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/DayTro/${id}`);
  }

  getPhongTros(dayTroId?: number, tang?: number, trangThai?: string): Observable<PhongTro[]> {
    let url = `${this.baseUrl}/PhongTro?`;
    if (dayTroId) url += `dayTroId=${dayTroId}&`;
    if (tang) url += `tang=${tang}&`;
    if (trangThai) url += `trangThai=${trangThai}&`;
    return this.http.get<PhongTro[]>(url);
  }

  getPhongTro(id: number): Observable<PhongTro> {
    return this.http.get<PhongTro>(`${this.baseUrl}/PhongTro/${id}`);
  }

  getPhongTrosByDayTro(dayTroId: number): Observable<PhongTro[]> {
    return this.http.get<PhongTro[]>(`${this.baseUrl}/PhongTro/by-daytro/${dayTroId}`);
  }

  createPhongTro(data: any): Observable<PhongTro> {
    return this.http.post<PhongTro>(`${this.baseUrl}/PhongTro`, data);
  }

  updatePhongTro(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/PhongTro/${id}`, data);
  }

  deletePhongTro(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/PhongTro/${id}`);
  }

  getKhachThues(search: string = ''): Observable<KhachThue[]> {
    let url = `${this.baseUrl}/KhachThue`;

    if (search && search.trim() !== '') {
      url += `?search=${encodeURIComponent(search.trim())}`;
    }

    return this.http.get<KhachThue[]>(url);
  }

  getKhachThue(id: number): Observable<KhachThue> {
    return this.http.get<KhachThue>(`${this.baseUrl}/KhachThue/${id}`);
  }

  createKhachThue(data: any): Observable<KhachThue> {
    return this.http.post<KhachThue>(`${this.baseUrl}/KhachThue`, data);
  }

  updateKhachThue(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/KhachThue/${id}`, data);
  }

  deleteKhachThue(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/KhachThue/${id}`);
  }

  chuyenPhong(id: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/KhachThue/${id}/chuyen-phong`, data);
  }

  traPhong(id: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/KhachThue/${id}/tra-phong`, data);
  }

  getLichSuChuyenPhong(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/KhachThue/${id}/lich-su-chuyen-phong`);
  }

  getHopDongs(phongTroId?: number, khachThueId?: number, trangThai?: string): Observable<HopDong[]> {
    let url = `${this.baseUrl}/HopDong?`;
    if (phongTroId) url += `phongTroId=${phongTroId}&`;
    if (khachThueId) url += `khachThueId=${khachThueId}&`;
    if (trangThai) url += `trangThai=${trangThai}&`;
    return this.http.get<HopDong[]>(url);
  }

  getHopDong(id: number): Observable<HopDong> {
    return this.http.get<HopDong>(`${this.baseUrl}/HopDong/${id}`);
  }

  createHopDong(data: any): Observable<HopDong> {
    return this.http.post<HopDong>(`${this.baseUrl}/HopDong`, data);
  }

  updateHopDong(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/HopDong/${id}`, data);
  }

  ketThucHopDong(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/HopDong/${id}/ket-thuc`, {});
  }

  giaHanHopDong(id: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/HopDong/${id}/gia-han`, data);
  }

  deleteHopDong(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/HopDong/${id}`);
  }

  getDichVus(dayTroId?: number, phongTroId?: number): Observable<DichVu[]> {
    let url = `${this.baseUrl}/DichVu?`;
    if (dayTroId) url += `dayTroId=${dayTroId}&`;
    if (phongTroId) url += `phongTroId=${phongTroId}&`;
    return this.http.get<DichVu[]>(url);
  }

  getDichVu(id: number): Observable<DichVu> {
    return this.http.get<DichVu>(`${this.baseUrl}/DichVu/${id}`);
  }

  createDichVu(data: any): Observable<DichVu> {
    return this.http.post<DichVu>(`${this.baseUrl}/DichVu`, data);
  }

  updateDichVu(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/DichVu/${id}`, data);
  }

  deleteDichVu(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/DichVu/${id}`);
  }

  getGiaDichVuTheoPhong(phongTroId: number): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/DichVu/gia-theo-phong/${phongTroId}`);
  }

  getChiSoCongTos(phongTroId?: number, loaiCongTo?: string, thangNam?: string): Observable<ChiSoCongTo[]> {
    let url = `${this.baseUrl}/ChiSoCongTo?`;
    if (phongTroId) url += `phongTroId=${phongTroId}&`;
    if (loaiCongTo) url += `loaiCongTo=${loaiCongTo}&`;
    if (thangNam) url += `thangNam=${thangNam}&`;
    return this.http.get<ChiSoCongTo[]>(url);
  }

  getChiSoCongTo(id: number): Observable<ChiSoCongTo> {
    return this.http.get<ChiSoCongTo>(`${this.baseUrl}/ChiSoCongTo/${id}`);
  }

  createChiSoCongTo(data: any): Observable<ChiSoCongTo> {
    return this.http.post<ChiSoCongTo>(`${this.baseUrl}/ChiSoCongTo`, data);
  }

  updateChiSoCongTo(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/ChiSoCongTo/${id}`, data);
  }

  deleteChiSoCongTo(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/ChiSoCongTo/${id}`);
  }

  getGoiYChiSo(phongTroId: number, loaiCongTo: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/ChiSoCongTo/goi-y/${phongTroId}/${loaiCongTo}`);
  }

  getLichSuChiSo(phongTroId: number, loaiCongTo: string, soThang: number = 12): Observable<ChiSoCongTo[]> {
    return this.http.get<ChiSoCongTo[]>(`${this.baseUrl}/ChiSoCongTo/lich-su/${phongTroId}/${loaiCongTo}?soThang=${soThang}`);
  }

  getHoaDons(): Observable<HoaDon[]> {
    return this.http.get<HoaDon[]>(`${this.baseUrl}/HoaDon`);
  }

  getHoaDon(id: number): Observable<HoaDon> {
    return this.http.get<HoaDon>(`${this.baseUrl}/HoaDon/${id}`);
  }

  createHoaDon(data: any): Observable<HoaDon> {
    return this.http.post<HoaDon>(`${this.baseUrl}/HoaDon`, data);
  }

  tuDongTinhHoaDon(phongTroId: number, thangNam: string): Observable<HoaDon> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const dateToSend = thangNam + '-01';
    return this.http.post<HoaDon>(
      `${this.baseUrl}/HoaDon/tu-dong-tinh/${phongTroId}`,
      JSON.stringify(dateToSend),
      { headers }
    );
  }

  updateHoaDon(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/HoaDon/${id}`, data);
  }

  deleteHoaDon(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/HoaDon/${id}`);
  }

  thanhToanHoaDon(id: number, data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/HoaDon/${id}/thanh-toan`, data);
  }

  getHoaDonsChuaThanhToan(): Observable<HoaDon[]> {
    return this.http.get<HoaDon[]>(`${this.baseUrl}/HoaDon/chua-thanh-toan`);
  }

  getThongKe(): Observable<ThongKe> {
    return this.http.get<ThongKe>(`${this.baseUrl}/Dashboard/thong-ke`);
  }

  getDoanhThu12Thang(): Observable<DoanhThuThang[]> {
    return this.http.get<DoanhThuThang[]>(`${this.baseUrl}/Dashboard/doanh-thu-12-thang`);
  }

  getTopPhongTieuThu(loaiCongTo: string = 'Điện', top: number = 5): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Dashboard/top-phong-tieu-thu?loaiCongTo=${loaiCongTo}&top=${top}`);
  }

  getBaoCaoCongNo(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Dashboard/bao-cao-cong-no`);
  }

  getMyRoom(): Observable<PhongTro> {
    return this.http.get<PhongTro>(`${this.baseUrl}/Tenant/room`);
  }

  getMyInvoices(): Observable<HoaDon[]> {
    return this.http.get<HoaDon[]>(`${this.baseUrl}/Tenant/invoices`);
  }

  getMyMeterReadings(): Observable<ChiSoCongTo[]> {
    return this.http.get<ChiSoCongTo[]>(`${this.baseUrl}/Tenant/meter-readings`);
  }

  getMyContracts(): Observable<HopDong[]> {
    return this.http.get<HopDong[]>(`${this.baseUrl}/Tenant/contracts`);
  }

  createYeuCauChinhSua(data: {
    phongTroId: number;
    loaiYeuCau: string;
    tieuDe: string;
    noiDung: string;
    anhMinhHoa?: string;
  }): Observable<YeuCauChinhSua> {
    return this.http.post<YeuCauChinhSua>(`${this.baseUrl}/YeuCauChinhSua`, data);
  }

  getMyYeuCauChinhSuas(): Observable<YeuCauChinhSua[]> {
    return this.http.get<YeuCauChinhSua[]>(`${this.baseUrl}/YeuCauChinhSua/tenant`);
  }

  submitMeterReading(data: {
    phongTroId: number;
    loaiCongTo: string;
    chiSo: number;
    thangNam: string;
    anhCongTo?: string;
    ghiChu?: string;
  }): Observable<ChiSoCongToGuiTuThue> {
    return this.http.post<ChiSoCongToGuiTuThue>(`${this.baseUrl}/ChiSoCongToGuiTuThue`, data);
  }

  getMySubmittedMeterReadings(): Observable<ChiSoCongToGuiTuThue[]> {
    return this.http.get<ChiSoCongToGuiTuThue[]>(`${this.baseUrl}/ChiSoCongToGuiTuThue/tenant`);
  }

  downloadContractPdf(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/Pdf/contract/${id}`, { responseType: 'blob' });
  }

  downloadInvoicePdf(id: number): Observable<Blob> {
    return this.http.get(`${this.baseUrl}/Pdf/invoice/${id}`, { responseType: 'blob' });
  }

  getTenantNotifications(): Observable<ThongBao[]> {
    return this.http.get<ThongBao[]>(`${this.baseUrl}/ThongBao/tenant`);
  }

  getOwnerNotifications(): Observable<ThongBao[]> {
    return this.http.get<ThongBao[]>(`${this.baseUrl}/ThongBao/owner`);
  }

  createThongBao(data: {
    tieuDe: string;
    noiDung: string;
    dayTroId?: number;
    phongTroId?: number;
  }): Observable<ThongBao> {
    return this.http.post<ThongBao>(`${this.baseUrl}/ThongBao`, data);
  }

  deleteThongBao(id: number): Observable<any> {
    return this.http.delete<any>(`${this.baseUrl}/ThongBao/${id}`);
  }

  markThongBaoRead(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ThongBao/${id}/mark-read`, {});
  }

  getAllYeuCaus(): Observable<YeuCauChinhSua[]> {
    return this.http.get<YeuCauChinhSua[]>(`${this.baseUrl}/YeuCauChinhSua/owner`);
  }

  respondToYeuCau(id: number, data: { phanHoi: string, trangThai: string }): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/YeuCauChinhSua/${id}/response`, data);
  }

  getAllSubmittedMeterReadings(): Observable<ChiSoCongToGuiTuThue[]> {
    return this.http.get<ChiSoCongToGuiTuThue[]>(`${this.baseUrl}/ChiSoCongToGuiTuThue/owner`);
  }

  confirmMeterReading(id: number, chiSoCu: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ChiSoCongToGuiTuThue/${id}/confirm`, chiSoCu);
  }

  rejectMeterReading(id: number, lyDo: string): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/ChiSoCongToGuiTuThue/${id}/reject`, JSON.stringify(lyDo), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  uploadEditRequestImage(file: File): Observable<{ message: string, filePath: string, fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string, filePath: string, fileUrl: string }>(`${this.baseUrl}/FileUpload/edit-request`, formData);
  }

  uploadMeterReadingImage(file: File): Observable<{ message: string, filePath: string, fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string, filePath: string, fileUrl: string }>(`${this.baseUrl}/FileUpload/meter-reading`, formData);
  }

  getBieuMaus(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/BieuMau`);
  }

  saveBieuMau(data: any): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/BieuMau`, data);
  }

  getPreviewHopDong(id: number): Observable<{ html: string }> {
    return this.http.get<{ html: string }>(`${this.baseUrl}/BieuMau/preview-hop-dong/${id}`);
  }

  exportPdfFromHtml(html: string): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/BieuMau/export-pdf`, { htmlContent: html }, { responseType: 'blob' });
  }

  getPreviewHoaDon(id: number): Observable<{ html: string }> {
    return this.http.get<{ html: string }>(`${this.baseUrl}/BieuMau/preview-hoa-don/${id}`);
  }

  uploadImage(file: File, folder: string): Observable<{ message: string, filePath: string, fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string, filePath: string, fileUrl: string }>(
      `${this.baseUrl}/FileUpload/image?folder=${folder}`,
      formData
    );
  }

  submitPaymentProof(hoaDonId: number, imageUrl: string): Observable<any> {
    return this.http.post(`${this.baseUrl}/HoaDon/${hoaDonId}/submit-proof`, JSON.stringify(imageUrl), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  deletePaymentProof(id: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/HoaDon/${id}/delete-proof`, {});
  }

  getHopDongSapHetHan(): Observable<any[]> {
    return this.http.get<any[]>(`${this.baseUrl}/Dashboard/hop-dong-sap-het-han`);
  }

  sendHoaDonEmail(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/HoaDon/${id}/send-email`, {});
  }

  sendHopDongEmail(id: number): Observable<any> {
    return this.http.post<any>(`${this.baseUrl}/HopDong/${id}/send-email`, {});
  }

  deleteYeuCau(id: number) {
    return this.http.delete(`${this.baseUrl}/YeuCauChinhSua/${id}`);
  }

  deleteMeterReading(id: number) {
    return this.http.delete(`${this.baseUrl}/ChiSoCongToGuiTuThue/${id}`);
  }

  getChiPhis(): Observable<ChiPhi[]> {
    return this.http.get<ChiPhi[]>(`${this.baseUrl}/ChiPhi`);
  }

  createChiPhi(data: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/ChiPhi`, data);
  }

  updateChiPhi(id: number, data: any): Observable<any> {
    return this.http.put(`${this.baseUrl}/ChiPhi/${id}`, data);
  }

  deleteChiPhi(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/ChiPhi/${id}`);
  }

  getTongTieuThuThang(): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/Dashboard/tong-tieu-thu-thang`);
  }
}

