using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLPhongTro.API.Data;
using QLPhongTro.API.DTOs;
using System.Security.Claims;

namespace QLPhongTro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class DashboardController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DashboardController(ApplicationDbContext context)
    {
        _context = context;
    }

    private async Task<(bool IsAdmin, int? DayTroId)> GetUserScopeAsync()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return (false, null);

        var userId = int.Parse(userIdClaim.Value);
        var user = await _context.Users.FindAsync(userId);

        if (user == null) return (false, null);

        var isAdmin = user.VaiTro == "Admin" || user.VaiTro == "Administrator";

        if (isAdmin) return (true, null);

        var dayTro = await _context.DayTros.FirstOrDefaultAsync(d => d.UserId == userId);
        return (false, dayTro?.Id);
    }

    private ThongKeDTO CreateEmptyThongKe()
    {
        return new ThongKeDTO
        {
            TongSoPhong = 0,
            PhongTrong = 0,
            PhongDaThue = 0,
            PhongDangSua = 0,
            DoanhThuThang = 0,
            TongCongNo = 0,
            HoaDonChuaThanhToan = 0
        };
    }

    [HttpGet("thong-ke")]
    public async Task<ActionResult<ThongKeDTO>> GetThongKe()
    {
        var (isAdmin, dayTroId) = await GetUserScopeAsync();

        if (!isAdmin && !dayTroId.HasValue)
        {
            return Ok(CreateEmptyThongKe());
        }

        // Query base cho phòng trọ
        var phongTroQuery = _context.PhongTros.AsQueryable();

        if (!isAdmin && dayTroId.HasValue)
        {
            phongTroQuery = phongTroQuery.Where(p => p.DayTroId == dayTroId.Value);
        }

        var tongSoPhong = await phongTroQuery.CountAsync();
        var phongTrong = await phongTroQuery.CountAsync(p => p.TrangThai == "Trống");
        var phongDaThue = await phongTroQuery.CountAsync(p => p.TrangThai == "Đã thuê");
        var phongDangSua = await phongTroQuery.CountAsync(p => p.TrangThai == "Đang sửa chữa");

        // Query base cho hóa đơn
        var hoaDonQuery = _context.HoaDons.Include(h => h.PhongTro).AsQueryable();

        if (!isAdmin && dayTroId.HasValue)
        {
            hoaDonQuery = hoaDonQuery.Where(h => h.PhongTro != null && h.PhongTro.DayTroId == dayTroId.Value);
        }

        var thangHienTai = DateTime.Now;
        var doanhThuThang = await hoaDonQuery
            .Where(h => h.ThangNam.Month == thangHienTai.Month &&
                       h.ThangNam.Year == thangHienTai.Year &&
                       h.TrangThai == "Đã thanh toán")
            .SumAsync(h => h.TongTien);

        var tongCongNo = await hoaDonQuery
            .Where(h => h.TrangThai != "Đã thanh toán")
            .SumAsync(h => h.TongTien);

        var hoaDonChuaThanhToan = await hoaDonQuery
            .CountAsync(h => h.TrangThai != "Đã thanh toán");

        var thongKe = new ThongKeDTO
        {
            TongSoPhong = tongSoPhong,
            PhongTrong = phongTrong,
            PhongDaThue = phongDaThue,
            PhongDangSua = phongDangSua,
            DoanhThuThang = doanhThuThang,
            TongCongNo = tongCongNo,
            HoaDonChuaThanhToan = hoaDonChuaThanhToan
        };

        return Ok(thongKe);
    }

    [HttpGet("doanh-thu-12-thang")]
    public async Task<ActionResult<IEnumerable<DoanhThuThangDTO>>> GetDoanhThu12Thang()
    {
        var (isAdmin, dayTroId) = await GetUserScopeAsync();

        if (!isAdmin && !dayTroId.HasValue)
        {
            return Ok(new List<DoanhThuThangDTO>());
        }

        var thangHienTai = DateTime.Now;
        var doanhThu12Thang = new List<DoanhThuThangDTO>();

        for (int i = 11; i >= 0; i--)
        {
            var thang = thangHienTai.AddMonths(-i);
            var hoaDonQuery = _context.HoaDons
                .Include(h => h.PhongTro)
                .Where(h => h.ThangNam.Month == thang.Month &&
                           h.ThangNam.Year == thang.Year &&
                           h.TrangThai == "Đã thanh toán");

            if (!isAdmin && dayTroId.HasValue)
            {
                hoaDonQuery = hoaDonQuery.Where(h => h.PhongTro != null && h.PhongTro.DayTroId == dayTroId.Value);
            }

            var doanhThu = await hoaDonQuery.SumAsync(h => h.TongTien);

            doanhThu12Thang.Add(new DoanhThuThangDTO
            {
                Thang = thang.Month,
                Nam = thang.Year,
                DoanhThu = doanhThu
            });
        }

        return Ok(doanhThu12Thang);
    }

    [HttpGet("top-phong-tieu-thu")]
    public async Task<ActionResult<IEnumerable<TopPhongTieuThuDTO>>> GetTopPhongTieuThu([FromQuery] string loaiCongTo = "Điện", [FromQuery] int top = 5)
    {
        var (isAdmin, dayTroId) = await GetUserScopeAsync();

        if (!isAdmin && !dayTroId.HasValue)
        {
            return Ok(new List<TopPhongTieuThuDTO>());
        }

        var thangHienTai = DateTime.Now;

        var chiSoQuery = _context.ChiSoCongTos
            .Include(c => c.PhongTro)
            .Where(c => c.LoaiCongTo == loaiCongTo &&
                       c.ThangNam.Month == thangHienTai.Month &&
                       c.ThangNam.Year == thangHienTai.Year);

        if (!isAdmin && dayTroId.HasValue)
        {
            chiSoQuery = chiSoQuery.Where(c => c.PhongTro != null && c.PhongTro.DayTroId == dayTroId.Value);
        }

        var topPhong = await chiSoQuery
            .OrderByDescending(c => c.SoTieuThu)
            .Take(top)
            .Select(c => new TopPhongTieuThuDTO
            {
                PhongTroId = c.PhongTroId,
                SoPhong = c.PhongTro != null ? c.PhongTro.SoPhong : null,
                SoTieuThu = c.SoTieuThu,
                LoaiCongTo = c.LoaiCongTo
            })
            .ToListAsync();

        return Ok(topPhong);
    }

    [HttpGet("bao-cao-cong-no")]
    public async Task<ActionResult<IEnumerable<BaoCaoCongNoDTO>>> GetBaoCaoCongNo()
    {
        var (isAdmin, dayTroId) = await GetUserScopeAsync();

        if (!isAdmin && !dayTroId.HasValue)
        {
            return Ok(new List<BaoCaoCongNoDTO>());
        }

        var hoaDonQuery = _context.HoaDons
            .Include(h => h.PhongTro)
            .Where(h => h.TrangThai != "Đã thanh toán");

        if (!isAdmin && dayTroId.HasValue)
        {
            hoaDonQuery = hoaDonQuery.Where(h => h.PhongTro != null && h.PhongTro.DayTroId == dayTroId.Value);
        }

        var baoCao = await hoaDonQuery
            .GroupBy(h => h.PhongTroId)
            .Select(g => new
            {
                PhongTroId = g.Key,
                FirstHoaDon = g.FirstOrDefault(),
                TongCongNo = g.Sum(h => h.TongTien),
                SoHoaDon = g.Count()
            })
            .ToListAsync();

        var result = baoCao.Select(g => new BaoCaoCongNoDTO
        {
            PhongTroId = g.PhongTroId,
            SoPhong = g.FirstHoaDon != null && g.FirstHoaDon.PhongTro != null ? g.FirstHoaDon.PhongTro.SoPhong : null,
            TongCongNo = g.TongCongNo,
            SoHoaDon = g.SoHoaDon
        })
        .OrderByDescending(b => b.TongCongNo)
        .ToList();

        return Ok(result);
    }

    [HttpGet("hop-dong-sap-het-han")]
    public async Task<ActionResult<IEnumerable<object>>> GetHopDongSapHetHan()
    {
        var (isAdmin, dayTroId) = await GetUserScopeAsync();

        // Tính toán mốc thời gian 
        var today = DateTime.Now.Date;
        var next30Days = today.AddDays(30);

        // Query cơ bản 
        var query = _context.HopDongs
            .Include(h => h.PhongTro)
            .Include(h => h.KhachThue)
            .Where(h => h.TrangThai == "Đang hiệu lực");

        // Filter theo quyền (Admin/Chủ trọ)
        if (!isAdmin && dayTroId.HasValue)
        {
            query = query.Where(h => h.PhongTro != null && h.PhongTro.DayTroId == dayTroId.Value);
        }

        // Filter ngày tháng 
        var endOfRange = next30Days.AddDays(1).AddTicks(-1); 

        query = query.Where(h => h.NgayKetThuc >= today && h.NgayKetThuc <= endOfRange);

        // Lấy dữ liệu về RAM trước (ToList) rồi mới tính toán SoNgayConLai
        var rawList = await query.ToListAsync();

        var result = rawList.Select(h => new
        {
            h.Id,
            h.MaHopDong,
            TenPhong = h.PhongTro?.TenPhong,
            TenKhach = h.KhachThue?.HoTen,
            NgayKetThuc = h.NgayKetThuc,

            SoNgayConLai = (int)(h.NgayKetThuc.Date - today).TotalDays
        })
        .OrderBy(x => x.SoNgayConLai)
        .ToList();

        return Ok(result);
    }
}

