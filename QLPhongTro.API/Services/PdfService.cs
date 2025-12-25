using Microsoft.EntityFrameworkCore;
using QLPhongTro.API.Data;
using QLPhongTro.API.DTOs;
using QLPhongTro.API.Models;

namespace QLPhongTro.API.Services;

public class PdfService : IPdfService
{
    private readonly ApplicationDbContext _context;
    private readonly ITemplateService _templateService;

    public PdfService(ApplicationDbContext context, ITemplateService templateService)
    {
        _context = context;
        _templateService = templateService;
    }

    // XUẤT PDF HỢP ĐỒNG
    public async Task<byte[]> GenerateContractPdfAsync(int hopDongId)
    {
        var hopDong = await _context.HopDongs
            .Include(h => h.KhachThue)
            .Include(h => h.PhongTro)
                .ThenInclude(p => p!.DayTro)
                    .ThenInclude(d => d!.User) 
            .FirstOrDefaultAsync(h => h.Id == hopDongId);

        if (hopDong == null)
            throw new Exception("Hợp đồng không tồn tại.");

        var chuTroUserId = hopDong.PhongTro?.DayTro?.UserId;

        var mau = await _context.BieuMaus
            .Where(b => b.LoaiBieuMau == "HOP_DONG" && (b.UserId == chuTroUserId || b.UserId == null))
            .OrderByDescending(b => b.UserId.HasValue) 
            .FirstOrDefaultAsync();

        string templateContent = mau?.NoiDung ?? "<h1>Hợp đồng mẫu chưa được thiết lập. Vui lòng liên hệ chủ trọ.</h1>";

        var chuTro = hopDong.PhongTro?.DayTro?.User;

        var data = new HopDongPrintDTO
        {
            MA_HOP_DONG = hopDong.MaHopDong,
            TEN_PHONG = hopDong.PhongTro?.TenPhong ?? "Chưa xác định",
            GIA_THUE = hopDong.GiaThue.ToString("N0"),
            TIEN_COC = hopDong.TienCoc.ToString("N0"),
            NGAY_BAT_DAU = hopDong.NgayBatDau.ToString("dd/MM/yyyy"),
            NGAY_KET_THUC = hopDong.NgayKetThuc.ToString("dd/MM/yyyy"),
            TEN_KHACH = hopDong.KhachThue?.HoTen ?? "....................",
            CCCD = hopDong.KhachThue?.CCCD ?? "....................",
            DIA_CHI_THUONG_TRU = hopDong.KhachThue?.DiaChiThuongTru ?? "....................",
            SO_DIEN_THOAI = hopDong.KhachThue?.SoDienThoai ?? "....................",
            TEN_CHU_TRO = chuTro?.HoTen ?? "....................",
            SDT_CHU_TRO = chuTro?.SoDienThoai ?? "....................",
            NGAY_TAO = DateTime.Now.ToString("dd 'tháng' MM 'năm' yyyy")
        };

        var finalHtmlContent = await _templateService.GetMergedContentAsync(templateContent, data);
        return await _templateService.ConvertHtmlToPdfAsync(finalHtmlContent);
    }

    // XUẤT PDF HÓA ĐƠN
    public async Task<byte[]> GenerateInvoicePdfAsync(int hoaDonId)
    {
        var hoaDon = await _context.HoaDons
            .Include(h => h.PhongTro)
                .ThenInclude(p => p!.DayTro)
                    .ThenInclude(d => d!.User) 
            .Include(h => h.PhongTro)
                .ThenInclude(p => p!.KhachThues)
            .FirstOrDefaultAsync(h => h.Id == hoaDonId);

        if (hoaDon == null)
            throw new Exception("Hóa đơn không tồn tại");

        var chuTroUserId = hoaDon.PhongTro?.DayTro?.UserId;

        var mau = await _context.BieuMaus
            .Where(b => b.LoaiBieuMau == "HOA_DON" && (b.UserId == chuTroUserId || b.UserId == null))
            .OrderByDescending(b => b.UserId.HasValue) 
            .FirstOrDefaultAsync();

        string defaultTemplate = @"
            <h1 style='text-align:center'>HÓA ĐƠN TIỀN NHÀ (Mặc định)</h1>
            <p>Vui lòng cập nhật mẫu hóa đơn trong trang quản lý.</p>
            <p>Phòng: {{TEN_PHONG}} - Tháng: {{THANG_NAM}}</p>
            <table border='1' style='width:100%; border-collapse:collapse'>
                <tr><td>Tổng tiền</td><td>{{TONG_TIEN}}</td></tr>
            </table>";

        string templateContent = mau?.NoiDung ?? defaultTemplate;

        var tenKhach = "Chưa xác định";
        if (hoaDon.PhongTro?.KhachThues != null)
        {
            var khach = hoaDon.PhongTro.KhachThues.FirstOrDefault(k => k.NgayKetThucThue == null);
            if (khach != null) tenKhach = khach.HoTen;
        }

        var data = new HoaDonPrintDTO
        {
            MA_HOA_DON = hoaDon.MaHoaDon,
            TEN_PHONG = hoaDon.PhongTro?.TenPhong ?? "",
            THANG_NAM = hoaDon.ThangNam.ToString("MM/yyyy"),
            TIEN_PHONG = hoaDon.TienPhong.ToString("N0"),
            TIEN_DIEN = hoaDon.TienDien.ToString("N0"),
            TIEN_NUOC = hoaDon.TienNuoc.ToString("N0"),
            TIEN_DICH_VU = (hoaDon.TienInternet + hoaDon.TienVeSinh).ToString("N0"),
            CONG_NO = hoaDon.CongNoThangTruoc.ToString("N0"),
            TONG_TIEN = hoaDon.TongTien.ToString("N0"),
            TEN_KHACH = tenKhach
        };

        var finalHtmlContent = await _templateService.GetMergedContentAsync(templateContent, data);
        return await _templateService.ConvertHtmlToPdfAsync(finalHtmlContent);
    }
}