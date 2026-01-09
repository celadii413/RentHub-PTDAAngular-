using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLPhongTro.API.Data;
using QLPhongTro.API.DTOs;
using QLPhongTro.API.Models;
using QLPhongTro.API.Services;
using System.Security.Claims;

namespace QLPhongTro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class BieuMauController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ITemplateService _templateService;

    public BieuMauController(ApplicationDbContext context, ITemplateService templateService)
    {
        _context = context;
        _templateService = templateService;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet]
    public async Task<ActionResult<IEnumerable<BieuMauDTO>>> GetBieuMaus()
    {
        var userId = GetUserId();
        // Lấy biểu mẫu của User hoặc biểu mẫu chung (UserId == null)
        var list = await _context.BieuMaus
            .Where(b => b.UserId == userId || b.UserId == null)
            .Select(b => new BieuMauDTO
            {
                Id = b.Id,
                TenBieuMau = b.TenBieuMau,
                LoaiBieuMau = b.LoaiBieuMau,
                NoiDung = b.NoiDung
            })
            .ToListAsync();
        return Ok(list);
    }

    [HttpPost]
    public async Task<IActionResult> SaveBieuMau([FromBody] BieuMauDTO dto)
    {
        var userId = GetUserId();
        var bieuMau = await _context.BieuMaus.FirstOrDefaultAsync(b => b.Id == dto.Id && b.UserId == userId);

        if (bieuMau == null)
        {
            bieuMau = new BieuMau { UserId = userId };
            _context.BieuMaus.Add(bieuMau);
        }

        bieuMau.TenBieuMau = dto.TenBieuMau;
        bieuMau.LoaiBieuMau = dto.LoaiBieuMau;
        bieuMau.NoiDung = dto.NoiDung;
        bieuMau.NgayCapNhat = DateTime.Now;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Lưu biểu mẫu thành công", id = bieuMau.Id });
    }

    [HttpGet("preview-hop-dong/{hopDongId}")]
    public async Task<ActionResult<string>> GetPreviewHopDong(int hopDongId)
    {
        var userId = GetUserId();

        var hopDong = await _context.HopDongs
            .Include(h => h.KhachThue) 
            .Include(h => h.PhongTro)
                .ThenInclude(p => p!.DayTro)
                    .ThenInclude(d => d!.User) 
            .FirstOrDefaultAsync(h => h.Id == hopDongId);

        if (hopDong == null) return NotFound(new { message = "Hợp đồng không tồn tại" });

        var user = hopDong?.PhongTro?.DayTro?.User;
        Console.WriteLine($"DEBUG: HopDongID: {hopDongId}");
        Console.WriteLine($"DEBUG: DayTro: {hopDong?.PhongTro?.DayTro?.TenDayTro}");
        Console.WriteLine($"DEBUG: UserId của DayTro: {hopDong?.PhongTro?.DayTro?.UserId}");
        Console.WriteLine($"DEBUG: User Object: {(user == null ? "NULL" : "EXIST")}");
        if (user != null)
        {
            Console.WriteLine($"DEBUG: HoTen: '{user.HoTen}', SDT: '{user.SoDienThoai}'");
        }

        // Lấy mẫu của chủ trọ (ưu tiên) hoặc mẫu mặc định
        var mau = await _context.BieuMaus
            .Where(b => b.LoaiBieuMau == "HOP_DONG" && (b.UserId == userId || b.UserId == null))
            .OrderByDescending(b => b.UserId) 
            .FirstOrDefaultAsync();

        string templateContent = mau?.NoiDung ?? "<h1>Hợp đồng mẫu chưa được thiết lập</h1>";

        var chuTro = hopDong.PhongTro?.DayTro?.User;

        var data = new HopDongPrintDTO
        {
            MA_HOP_DONG = hopDong.MaHopDong,
            TEN_PHONG = hopDong.PhongTro?.TenPhong ?? "Chưa xác định",
            GIA_THUE = hopDong.GiaThue.ToString("N0"),
            TIEN_COC = hopDong.TienCoc.ToString("N0"),
            NGAY_BAT_DAU = hopDong.NgayBatDau.ToString("dd/MM/yyyy"),
            NGAY_KET_THUC = hopDong.NgayKetThuc.ToString("dd/MM/yyyy"),

            // Thông tin Khách
            TEN_KHACH = hopDong.KhachThue?.HoTen ?? "....................",
            CCCD = hopDong.KhachThue?.CCCD ?? "....................",
            DIA_CHI_THUONG_TRU = hopDong.KhachThue?.DiaChiThuongTru ?? "....................",
            SO_DIEN_THOAI = hopDong.KhachThue?.SoDienThoai ?? "....................",

            TEN_CHU_TRO = chuTro?.HoTen ?? "....................",
            SDT_CHU_TRO = chuTro?.SoDienThoai ?? "....................",

            NGAY_TAO = DateTime.Now.ToString("dd 'tháng' MM 'năm' yyyy")
        };

        var mergedHtml = await _templateService.GetMergedContentAsync(templateContent, data);
        return Ok(new { html = mergedHtml });
    }

    // Xuất PDF từ HTML cuối cùng (sau khi người dùng đã sửa trên UI)
    [HttpPost("export-pdf")]
    public async Task<IActionResult> ExportPdf([FromBody] ExportPdfRequest request)
    {
        var pdfBytes = await _templateService.ConvertHtmlToPdfAsync(request.HtmlContent);
        return File(pdfBytes, "application/pdf", "document.pdf");
    }

    [HttpGet("preview-hoa-don/{hoaDonId}")]
    public async Task<ActionResult<string>> GetPreviewHoaDon(int hoaDonId)
    {
        var userId = GetUserId();
        var hoaDon = await _context.HoaDons
            .Include(h => h.PhongTro).ThenInclude(p => p!.DayTro).ThenInclude(d => d!.User)
            .Include(h => h.PhongTro).ThenInclude(p => p!.KhachThues)
            .FirstOrDefaultAsync(h => h.Id == hoaDonId);

        if (hoaDon == null) return NotFound(new { message = "Hóa đơn không tồn tại" });

        // Lấy mẫu hóa đơn
        var mau = await _context.BieuMaus
            .Where(b => b.LoaiBieuMau == "HOA_DON" && (b.UserId == userId || b.UserId == null))
            .OrderByDescending(b => b.UserId)
            .FirstOrDefaultAsync();

        // Mẫu mặc định nếu chưa tạo
        string templateContent = mau?.NoiDung ?? @"
            <h1 style='text-align:center'>HÓA ĐƠN TIỀN NHÀ</h1>
            <p>Phòng: {{TEN_PHONG}} - Tháng: {{THANG_NAM}}</p>
            <table border='1' style='width:100%; border-collapse:collapse'>
                <tr><td>Tiền phòng</td><td>{{TIEN_PHONG}}</td></tr>
                <tr><td>Điện</td><td>{{TIEN_DIEN}}</td></tr>
                <tr><td>Nước</td><td>{{TIEN_NUOC}}</td></tr>
                <tr><td>Dịch vụ</td><td>{{TIEN_DICH_VU}}</td></tr>
                <tr><td>Nợ cũ</td><td>{{CONG_NO}}</td></tr>
                <tr><th>TỔNG CỘNG</th><th>{{TONG_TIEN}}</th></tr>
            </table>";

        // Lấy tên khách đang thuê (lấy người đầu tiên chưa trả phòng hoặc người đại diện)
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

        var mergedHtml = await _templateService.GetMergedContentAsync(templateContent, data);
        return Ok(new { html = mergedHtml });
    }
}