using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLPhongTro.API.Data;
using QLPhongTro.API.DTOs;
using System.Security.Claims;

namespace QLPhongTro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Người thuê")]
public class TenantController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public TenantController(ApplicationDbContext context)
    {
        _context = context;
    }

    private int GetUserId() => int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

    [HttpGet("room")]
    public async Task<ActionResult<PhongTroDTO>> GetMyRoom()
    {
        var userId = GetUserId();
        var khachThue = await _context.KhachThues
            .Include(k => k.PhongTro).ThenInclude(p => p!.DayTro)
            .FirstOrDefaultAsync(k => k.UserId == userId && k.NgayKetThucThue == null);

        if (khachThue == null || khachThue.PhongTro == null)
            return NotFound(new { message = "Hiện tại bạn không thuê phòng nào hoặc đã trả phòng." });

        var phong = khachThue.PhongTro;
        var result = new PhongTroDTO
        {
            Id = phong.Id,
            SoPhong = phong.SoPhong,
            TenPhong = phong.TenPhong,
            Tang = phong.Tang,
            GiaThue = phong.GiaThue,
            TienCoc = phong.TienCoc,
            DienTich = phong.DienTich,
            MoTa = phong.MoTa,
            TrangThai = phong.TrangThai,
            DayTroId = phong.DayTroId,
            TenDayTro = phong.DayTro?.TenDayTro,
            NgayTao = phong.NgayTao,
            SoKhachThue = await _context.KhachThues.CountAsync(k => k.PhongTroId == phong.Id && k.NgayKetThucThue == null),
            HinhAnh1 = phong.HinhAnh1,
            HinhAnh2 = phong.HinhAnh2,
            HinhAnh3 = phong.HinhAnh3
        };
        return Ok(result);
    }

    [HttpGet("invoices")]
    public async Task<ActionResult<IEnumerable<HoaDonDTO>>> GetMyInvoices()
    {
        var userId = GetUserId();
        var phongTroIds = await _context.KhachThues
            .Where(k => k.UserId == userId)
            .Select(k => k.PhongTroId)
            .Distinct()
            .ToListAsync();

        if (!phongTroIds.Any()) return Ok(new List<HoaDonDTO>());

        var hoaDons = await _context.HoaDons
            .Include(h => h.PhongTro)
                .ThenInclude(p => p.DayTro)
                    .ThenInclude(d => d.User) 
            .Where(h => phongTroIds.Contains(h.PhongTroId))
            .OrderByDescending(h => h.ThangNam)
            .Select(h => new HoaDonDTO
            {
                Id = h.Id,
                MaHoaDon = h.MaHoaDon,
                PhongTroId = h.PhongTroId,
                SoPhong = h.PhongTro!.SoPhong,
                ThangNam = h.ThangNam,
                TienPhong = h.TienPhong,
                TienDien = h.TienDien,
                TienNuoc = h.TienNuoc,
                TienInternet = h.TienInternet,
                TienVeSinh = h.TienVeSinh,
                CongNoThangTruoc = h.CongNoThangTruoc,
                TongTien = h.TongTien,
                TrangThai = h.TrangThai,
                NgayThanhToan = h.NgayThanhToan,
                NgayTao = h.NgayTao,

                AnhMinhChung = h.AnhMinhChung,
                ChuTro_TenNganHang = h.PhongTro.DayTro.User.TenNganHang,
                ChuTro_SoTaiKhoan = h.PhongTro.DayTro.User.SoTaiKhoan,
                ChuTro_TenTaiKhoan = h.PhongTro.DayTro.User.TenTaiKhoan
            })
            .ToListAsync();

        return Ok(hoaDons);
    }

    [HttpGet("meter-readings")]
    public async Task<ActionResult<IEnumerable<ChiSoCongToDTO>>> GetMyMeterReadings()
    {
        var userId = GetUserId();
        var phongTroIds = await _context.KhachThues.Where(k => k.UserId == userId).Select(k => k.PhongTroId).Distinct().ToListAsync();
        if (!phongTroIds.Any()) return Ok(new List<ChiSoCongToDTO>());

        var chiSos = await _context.ChiSoCongTos.Include(c => c.PhongTro)
            .Where(c => phongTroIds.Contains(c.PhongTroId))
            .OrderByDescending(c => c.ThangNam).ThenByDescending(c => c.LoaiCongTo)
            .Select(c => new ChiSoCongToDTO { Id = c.Id, PhongTroId = c.PhongTroId, SoPhong = c.PhongTro!.SoPhong, LoaiCongTo = c.LoaiCongTo, ChiSoCu = c.ChiSoCu, ChiSoMoi = c.ChiSoMoi, SoTieuThu = c.SoTieuThu, ThangNam = c.ThangNam, NgayGhi = c.NgayGhi, GhiChu = c.GhiChu })
            .ToListAsync();
        return Ok(chiSos);
    }

    [HttpGet("contracts")]
    public async Task<ActionResult<IEnumerable<HopDongDTO>>> GetMyContracts()
    {
        var userId = GetUserId();
        var khachThueIds = await _context.KhachThues.Where(k => k.UserId == userId).Select(k => k.Id).ToListAsync();
        if (!khachThueIds.Any()) return Ok(new List<HopDongDTO>());

        var hopDongs = await _context.HopDongs.Include(h => h.PhongTro).Include(h => h.KhachThue)
            .Where(h => khachThueIds.Contains(h.KhachThueId))
            .OrderByDescending(h => h.NgayBatDau)
            .Select(h => new HopDongDTO { Id = h.Id, MaHopDong = h.MaHopDong, PhongTroId = h.PhongTroId, SoPhong = h.PhongTro!.SoPhong, KhachThueId = h.KhachThueId, TenKhachThue = h.KhachThue!.HoTen, NgayBatDau = h.NgayBatDau, NgayKetThuc = h.NgayKetThuc, GiaThue = h.GiaThue, TienCoc = h.TienCoc, TrangThai = h.TrangThai, GhiChu = h.GhiChu, NgayTao = h.NgayTao })
            .ToListAsync();
        return Ok(hopDongs);
    }
}