import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

const API_URL = 'http://localhost:5000/api';

export interface DayTro {
  id: number;
  tenDayTro: string;
  diaChi: string;
  soTang: number;
  soPhongMoiTang: number;
  moTa: string;
  ngayTao: string;
  tongSoPhong: number;
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

@Injectable({
  providedIn: 'root'
})

export class ApiService {
  constructor(private http: HttpClient) { }

  getDayTros(): Observable<DayTro[]> {
    return this.http.get<DayTro[]>(`${API_URL}/DayTro`);
  }

  getDayTro(id: number): Observable<DayTro> {
    return this.http.get<DayTro>(`${API_URL}/DayTro/${id}`);
  }

  createDayTro(data: any): Observable<DayTro> {
    return this.http.post<DayTro>(`${API_URL}/DayTro`, data);
  }

  updateDayTro(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${API_URL}/DayTro/${id}`, data);
  }

  deleteDayTro(id: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/DayTro/${id}`);
  }

  getPhongTros(dayTroId?: number, tang?: number, trangThai?: string): Observable<PhongTro[]> {
    let url = `${API_URL}/PhongTro?`;
    if (dayTroId) url += `dayTroId=${dayTroId}&`;
    if (tang) url += `tang=${tang}&`;
    if (trangThai) url += `trangThai=${trangThai}&`;
    return this.http.get<PhongTro[]>(url);
  }

  getPhongTro(id: number): Observable<PhongTro> {
    return this.http.get<PhongTro>(`${API_URL}/PhongTro/${id}`);
  }

  getPhongTrosByDayTro(dayTroId: number): Observable<PhongTro[]> {
    return this.http.get<PhongTro[]>(`${API_URL}/PhongTro/by-daytro/${dayTroId}`);
  }

  createPhongTro(data: any): Observable<PhongTro> {
    return this.http.post<PhongTro>(`${API_URL}/PhongTro`, data);
  }

  updatePhongTro(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${API_URL}/PhongTro/${id}`, data);
  }

  deletePhongTro(id: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/PhongTro/${id}`);
  }

  getKhachThues(): Observable<KhachThue[]> {
    return this.http.get<KhachThue[]>(`${API_URL}/KhachThue`);
  }

  getKhachThue(id: number): Observable<KhachThue> {
    return this.http.get<KhachThue>(`${API_URL}/KhachThue/${id}`);
  }

  createKhachThue(data: any): Observable<KhachThue> {
    return this.http.post<KhachThue>(`${API_URL}/KhachThue`, data);
  }

  updateKhachThue(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${API_URL}/KhachThue/${id}`, data);
  }

  deleteKhachThue(id: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/KhachThue/${id}`);
  }

  chuyenPhong(id: number, data: any): Observable<any> {
    return this.http.post<any>(`${API_URL}/KhachThue/${id}/chuyen-phong`, data);
  }

  traPhong(id: number, data: any): Observable<any> {
    return this.http.post<any>(`${API_URL}/KhachThue/${id}/tra-phong`, data);
  }

  getLichSuChuyenPhong(id: number): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/KhachThue/${id}/lich-su-chuyen-phong`);
  }

  getHopDongs(phongTroId?: number, khachThueId?: number, trangThai?: string): Observable<HopDong[]> {
    let url = `${API_URL}/HopDong?`;
    if (phongTroId) url += `phongTroId=${phongTroId}&`;
    if (khachThueId) url += `khachThueId=${khachThueId}&`;
    if (trangThai) url += `trangThai=${trangThai}&`;
    return this.http.get<HopDong[]>(url);
  }

  getHopDong(id: number): Observable<HopDong> {
    return this.http.get<HopDong>(`${API_URL}/HopDong/${id}`);
  }

  createHopDong(data: any): Observable<HopDong> {
    return this.http.post<HopDong>(`${API_URL}/HopDong`, data);
  }

  updateHopDong(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${API_URL}/HopDong/${id}`, data);
  }

  ketThucHopDong(id: number): Observable<any> {
    return this.http.post<any>(`${API_URL}/HopDong/${id}/ket-thuc`, {});
  }

  giaHanHopDong(id: number, data: any): Observable<any> {
    return this.http.post<any>(`${API_URL}/HopDong/${id}/gia-han`, data);
  }

  deleteHopDong(id: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/HopDong/${id}`);
  }

  getDichVus(dayTroId?: number, phongTroId?: number): Observable<DichVu[]> {
    let url = `${API_URL}/DichVu?`;
    if (dayTroId) url += `dayTroId=${dayTroId}&`;
    if (phongTroId) url += `phongTroId=${phongTroId}&`;
    return this.http.get<DichVu[]>(url);
  }

  getDichVu(id: number): Observable<DichVu> {
    return this.http.get<DichVu>(`${API_URL}/DichVu/${id}`);
  }

  createDichVu(data: any): Observable<DichVu> {
    return this.http.post<DichVu>(`${API_URL}/DichVu`, data);
  }

  updateDichVu(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${API_URL}/DichVu/${id}`, data);
  }

  deleteDichVu(id: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/DichVu/${id}`);
  }

  getGiaDichVuTheoPhong(phongTroId: number): Observable<any> {
    return this.http.get<any>(`${API_URL}/DichVu/gia-theo-phong/${phongTroId}`);
  }

  getChiSoCongTos(phongTroId?: number, loaiCongTo?: string, thangNam?: string): Observable<ChiSoCongTo[]> {
    let url = `${API_URL}/ChiSoCongTo?`;
    if (phongTroId) url += `phongTroId=${phongTroId}&`;
    if (loaiCongTo) url += `loaiCongTo=${loaiCongTo}&`;
    if (thangNam) url += `thangNam=${thangNam}&`;
    return this.http.get<ChiSoCongTo[]>(url);
  }

  getChiSoCongTo(id: number): Observable<ChiSoCongTo> {
    return this.http.get<ChiSoCongTo>(`${API_URL}/ChiSoCongTo/${id}`);
  }

  createChiSoCongTo(data: any): Observable<ChiSoCongTo> {
    return this.http.post<ChiSoCongTo>(`${API_URL}/ChiSoCongTo`, data);
  }

  updateChiSoCongTo(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${API_URL}/ChiSoCongTo/${id}`, data);
  }

  deleteChiSoCongTo(id: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/ChiSoCongTo/${id}`);
  }

  getGoiYChiSo(phongTroId: number, loaiCongTo: string): Observable<any> {
    return this.http.get<any>(`${API_URL}/ChiSoCongTo/goi-y/${phongTroId}/${loaiCongTo}`);
  }

  getLichSuChiSo(phongTroId: number, loaiCongTo: string, soThang: number = 12): Observable<ChiSoCongTo[]> {
    return this.http.get<ChiSoCongTo[]>(`${API_URL}/ChiSoCongTo/lich-su/${phongTroId}/${loaiCongTo}?soThang=${soThang}`);
  }

  getHoaDons(): Observable<HoaDon[]> {
    return this.http.get<HoaDon[]>(`${API_URL}/HoaDon`);
  }

  getHoaDon(id: number): Observable<HoaDon> {
    return this.http.get<HoaDon>(`${API_URL}/HoaDon/${id}`);
  }

  createHoaDon(data: any): Observable<HoaDon> {
    return this.http.post<HoaDon>(`${API_URL}/HoaDon`, data);
  }

  tuDongTinhHoaDon(phongTroId: number, thangNam: string): Observable<HoaDon> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    const dateToSend = thangNam + '-01';
    return this.http.post<HoaDon>(
      `${API_URL}/HoaDon/tu-dong-tinh/${phongTroId}`, 
      JSON.stringify(dateToSend), 
      { headers }
    );
  }

  updateHoaDon(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${API_URL}/HoaDon/${id}`, data);
  }

  deleteHoaDon(id: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/HoaDon/${id}`);
  }

  thanhToanHoaDon(id: number, data: any): Observable<any> {
    return this.http.post<any>(`${API_URL}/HoaDon/${id}/thanh-toan`, data);
  }

  getHoaDonsChuaThanhToan(): Observable<HoaDon[]> {
    return this.http.get<HoaDon[]>(`${API_URL}/HoaDon/chua-thanh-toan`);
  }

  getThongKe(): Observable<ThongKe> {
    return this.http.get<ThongKe>(`${API_URL}/Dashboard/thong-ke`);
  }

  getDoanhThu12Thang(): Observable<DoanhThuThang[]> {
    return this.http.get<DoanhThuThang[]>(`${API_URL}/Dashboard/doanh-thu-12-thang`);
  }

  getTopPhongTieuThu(loaiCongTo: string = 'Điện', top: number = 5): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/Dashboard/top-phong-tieu-thu?loaiCongTo=${loaiCongTo}&top=${top}`);
  }

  getBaoCaoCongNo(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/Dashboard/bao-cao-cong-no`);
  }

  getMyRoom(): Observable<PhongTro> {
    return this.http.get<PhongTro>(`${API_URL}/Tenant/room`);
  }

  getMyInvoices(): Observable<HoaDon[]> {
    return this.http.get<HoaDon[]>(`${API_URL}/Tenant/invoices`);
  }

  getMyMeterReadings(): Observable<ChiSoCongTo[]> {
    return this.http.get<ChiSoCongTo[]>(`${API_URL}/Tenant/meter-readings`);
  }

  getMyContracts(): Observable<HopDong[]> {
    return this.http.get<HopDong[]>(`${API_URL}/Tenant/contracts`);
  }

  createYeuCauChinhSua(data: {
    phongTroId: number;
    loaiYeuCau: string;
    tieuDe: string;
    noiDung: string;
    anhMinhHoa?: string;
  }): Observable<YeuCauChinhSua> {
    return this.http.post<YeuCauChinhSua>(`${API_URL}/YeuCauChinhSua`, data);
  }

  getMyYeuCauChinhSuas(): Observable<YeuCauChinhSua[]> {
    return this.http.get<YeuCauChinhSua[]>(`${API_URL}/YeuCauChinhSua/tenant`);
  }

  submitMeterReading(data: {
    phongTroId: number;
    loaiCongTo: string;
    chiSo: number;
    thangNam: string;
    anhCongTo?: string;
    ghiChu?: string;
  }): Observable<ChiSoCongToGuiTuThue> {
    return this.http.post<ChiSoCongToGuiTuThue>(`${API_URL}/ChiSoCongToGuiTuThue`, data);
  }

  getMySubmittedMeterReadings(): Observable<ChiSoCongToGuiTuThue[]> {
    return this.http.get<ChiSoCongToGuiTuThue[]>(`${API_URL}/ChiSoCongToGuiTuThue/tenant`);
  }

  downloadContractPdf(id: number): Observable<Blob> {
    return this.http.get(`${API_URL}/Pdf/contract/${id}`, { responseType: 'blob' });
  }

  downloadInvoicePdf(id: number): Observable<Blob> {
    return this.http.get(`${API_URL}/Pdf/invoice/${id}`, { responseType: 'blob' });
  }

  getTenantNotifications(): Observable<ThongBao[]> {
    return this.http.get<ThongBao[]>(`${API_URL}/ThongBao/tenant`);
  }

  getOwnerNotifications(): Observable<ThongBao[]> {
    return this.http.get<ThongBao[]>(`${API_URL}/ThongBao/owner`);
  }

  createThongBao(data: {
    tieuDe: string;
    noiDung: string;
    dayTroId?: number;
    phongTroId?: number;
  }): Observable<ThongBao> {
    return this.http.post<ThongBao>(`${API_URL}/ThongBao`, data);
  }

  deleteThongBao(id: number): Observable<any> {
    return this.http.delete<any>(`${API_URL}/ThongBao/${id}`);
  }

  markThongBaoRead(id: number): Observable<any> {
    return this.http.post<any>(`${API_URL}/ThongBao/${id}/mark-read`, {});
  }

  getAllYeuCaus(): Observable<YeuCauChinhSua[]> {
    return this.http.get<YeuCauChinhSua[]>(`${API_URL}/YeuCauChinhSua/owner`);
  }

  respondToYeuCau(id: number, data: { phanHoi: string, trangThai: string }): Observable<any> {
    return this.http.put<any>(`${API_URL}/YeuCauChinhSua/${id}/response`, data);
  }

  getAllSubmittedMeterReadings(): Observable<ChiSoCongToGuiTuThue[]> {
    return this.http.get<ChiSoCongToGuiTuThue[]>(`${API_URL}/ChiSoCongToGuiTuThue/owner`);
  }

  confirmMeterReading(id: number, chiSoCu: number): Observable<any> {
    return this.http.post<any>(`${API_URL}/ChiSoCongToGuiTuThue/${id}/confirm`, chiSoCu);
  }

  rejectMeterReading(id: number, lyDo: string): Observable<any> {
    return this.http.post<any>(`${API_URL}/ChiSoCongToGuiTuThue/${id}/reject`, JSON.stringify(lyDo), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  uploadEditRequestImage(file: File): Observable<{ message: string, filePath: string, fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string, filePath: string, fileUrl: string }>(`${API_URL}/FileUpload/edit-request`, formData);
  }

  uploadMeterReadingImage(file: File): Observable<{ message: string, filePath: string, fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string, filePath: string, fileUrl: string }>(`${API_URL}/FileUpload/meter-reading`, formData);
  }

  getBieuMaus(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/BieuMau`);
  }

  saveBieuMau(data: any): Observable<any> {
    return this.http.post<any>(`${API_URL}/BieuMau`, data);
  }

  getPreviewHopDong(id: number): Observable<{ html: string }> {
    return this.http.get<{ html: string }>(`${API_URL}/BieuMau/preview-hop-dong/${id}`);
  }

  exportPdfFromHtml(html: string): Observable<Blob> {
    return this.http.post(`${API_URL}/BieuMau/export-pdf`, { htmlContent: html }, { responseType: 'blob' });
  }

  getPreviewHoaDon(id: number): Observable<{ html: string }> {
  return this.http.get<{ html: string }>(`${API_URL}/BieuMau/preview-hoa-don/${id}`);
  }

  uploadImage(file: File, folder: string): Observable<{ message: string, filePath: string, fileUrl: string }> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<{ message: string, filePath: string, fileUrl: string }>(
      `${API_URL}/FileUpload/image?folder=${folder}`, 
      formData
    );
  }
  
  submitPaymentProof(hoaDonId: number, imageUrl: string): Observable<any> {
  return this.http.post(`${API_URL}/HoaDon/${hoaDonId}/submit-proof`, JSON.stringify(imageUrl), {
    headers: { 'Content-Type': 'application/json' }
    });
  }

  deletePaymentProof(id: number): Observable<any> {
    return this.http.post(`${API_URL}/HoaDon/${id}/delete-proof`, {});
  }

  getHopDongSapHetHan(): Observable<any[]> {
    return this.http.get<any[]>(`${API_URL}/Dashboard/hop-dong-sap-het-han`);
  }

  sendHoaDonEmail(id: number): Observable<any> {
    return this.http.post<any>(`${API_URL}/HoaDon/${id}/send-email`, {});
  }

  sendHopDongEmail(id: number): Observable<any> {
    return this.http.post<any>(`${API_URL}/HopDong/${id}/send-email`, {});
  }
}

