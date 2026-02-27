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
public class HoaDonController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IPdfService _pdfService;
    private readonly IFileService _fileService;

    public HoaDonController(ApplicationDbContext context, IEmailService emailService, IPdfService pdfService, IFileService fileService)
    {
        _context = context;
        _emailService = emailService;
        _pdfService = pdfService;
        _fileService = fileService;
    }

    // Lấy DayTroId của user hiện tại
    private async Task<int?> GetUserDayTroIdAsync()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return null;

        var userId = int.Parse(userIdClaim.Value);
        var user = await _context.Users.FindAsync(userId);
        
        if (user == null || user.VaiTro != "Chủ trọ") return null;

        var dayTro = await _context.DayTros.FirstOrDefaultAsync(d => d.UserId == userId);
        return dayTro?.Id;
    }

    // Kiểm tra user có phải là chủ trọ không
    private bool IsOwner()
    {
        var role = User.FindFirst(ClaimTypes.Role)?.Value;
        return role == "Chủ trọ";
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<HoaDonDTO>>> GetHoaDons()
    {
        var query = _context.HoaDons
            .Include(h => h.PhongTro)
            .AsQueryable();

        // Nếu là chủ trọ, chỉ trả về hóa đơn của phòng trong nhà trọ của mình
        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (userDayTroId.HasValue)
            {
                query = query.Where(h => h.PhongTro != null && h.PhongTro.DayTroId == userDayTroId.Value);
            }
            else
            {
                return Ok(new List<HoaDonDTO>());
            }
        }

        var hoaDons = await query
            .Select(h => new HoaDonDTO
            {
                Id = h.Id,
                MaHoaDon = h.MaHoaDon,
                PhongTroId = h.PhongTroId,
                SoPhong = h.PhongTro != null ? h.PhongTro.SoPhong : null,
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
                PhuongThucThanhToan = h.PhuongThucThanhToan,
                NgayTao = h.NgayTao,
                GhiChu = h.GhiChu,
                AnhMinhChung = h.AnhMinhChung,

                ChuTro_TenNganHang = h.PhongTro.DayTro.User.TenNganHang,
                ChuTro_SoTaiKhoan = h.PhongTro.DayTro.User.SoTaiKhoan,
                ChuTro_TenTaiKhoan = h.PhongTro.DayTro.User.TenTaiKhoan
            })
            .OrderByDescending(h => h.NgayTao)
            .ToListAsync();

        return Ok(hoaDons);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<HoaDonDTO>> GetHoaDon(int id)
    {
        var query = _context.HoaDons
            .Include(h => h.PhongTro)
            .Where(h => h.Id == id);

        // Nếu là chủ trọ, chỉ được xem hóa đơn của phòng trong nhà trọ của mình
        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (userDayTroId.HasValue)
            {
                query = query.Where(h => h.PhongTro != null && h.PhongTro.DayTroId == userDayTroId.Value);
            }
            else
            {
                return Forbid();
            }
        }

        var hoaDon = await query
            .Select(h => new HoaDonDTO
            {
                Id = h.Id,
                MaHoaDon = h.MaHoaDon,
                PhongTroId = h.PhongTroId,
                SoPhong = h.PhongTro != null ? h.PhongTro.SoPhong : null,
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
                PhuongThucThanhToan = h.PhuongThucThanhToan,
                NgayTao = h.NgayTao,
                GhiChu = h.GhiChu,
                AnhMinhChung = h.AnhMinhChung,

                ChuTro_TenNganHang = h.PhongTro.DayTro.User.TenNganHang,
                ChuTro_SoTaiKhoan = h.PhongTro.DayTro.User.SoTaiKhoan,
                ChuTro_TenTaiKhoan = h.PhongTro.DayTro.User.TenTaiKhoan
            })
            .FirstOrDefaultAsync();

        if (hoaDon == null)
        {
            return NotFound();
        }

        return Ok(hoaDon);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Chủ trọ,Nhân viên")]
    public async Task<ActionResult<HoaDonDTO>> CreateHoaDon(CreateHoaDonDTO dto)
    {
        var phongTro = await _context.PhongTros
            .Include(p => p.DayTro)
            .FirstOrDefaultAsync(p => p.Id == dto.PhongTroId);
        
        if (phongTro == null)
        {
            return BadRequest(new { message = "Phòng trọ không tồn tại" });
        }

        // Nếu là chủ trọ, chỉ được tạo hóa đơn cho phòng trong nhà trọ của mình
        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (!userDayTroId.HasValue || phongTro.DayTroId != userDayTroId.Value)
            {
                return Forbid();
            }
        }

        // Tính công nợ tháng trước
        var hoaDonThangTruoc = await _context.HoaDons
            .Where(h => h.PhongTroId == dto.PhongTroId && 
                       h.TrangThai != "Đã thanh toán" &&
                       h.ThangNam < dto.ThangNam)
            .OrderByDescending(h => h.ThangNam)
            .FirstOrDefaultAsync();

        decimal congNoThangTruoc = hoaDonThangTruoc != null ? hoaDonThangTruoc.TongTien : 0;

        var tongTien = dto.TienPhong + dto.TienDien + dto.TienNuoc + dto.TienInternet + dto.TienVeSinh + congNoThangTruoc;
        var randomCode = new Random().Next(10000, 99999);
        var maHoaDon = $"HD{DateTime.Now:yy}{randomCode}";

        var hoaDon = new HoaDon
        {
            MaHoaDon = maHoaDon,
            PhongTroId = dto.PhongTroId,
            ThangNam = dto.ThangNam,
            TienPhong = dto.TienPhong,
            TienDien = dto.TienDien,
            TienNuoc = dto.TienNuoc,
            TienInternet = dto.TienInternet,
            TienVeSinh = dto.TienVeSinh,
            CongNoThangTruoc = congNoThangTruoc,
            TongTien = tongTien,
            TrangThai = "Chưa thanh toán",
            NgayTao = DateTime.Now,
            GhiChu = dto.GhiChu
        };

        _context.HoaDons.Add(hoaDon);
        await _context.SaveChangesAsync();

        var result = new HoaDonDTO
        {
            Id = hoaDon.Id,
            MaHoaDon = hoaDon.MaHoaDon,
            PhongTroId = hoaDon.PhongTroId,
            SoPhong = phongTro.SoPhong,
            ThangNam = hoaDon.ThangNam,
            TienPhong = hoaDon.TienPhong,
            TienDien = hoaDon.TienDien,
            TienNuoc = hoaDon.TienNuoc,
            TienInternet = hoaDon.TienInternet,
            TienVeSinh = hoaDon.TienVeSinh,
            CongNoThangTruoc = hoaDon.CongNoThangTruoc,
            TongTien = hoaDon.TongTien,
            TrangThai = hoaDon.TrangThai,
            NgayThanhToan = hoaDon.NgayThanhToan,
            NgayTao = hoaDon.NgayTao,
            GhiChu = hoaDon.GhiChu
        };

        return CreatedAtAction(nameof(GetHoaDon), new { id = hoaDon.Id }, result);
    }

    [HttpPost("tu-dong-tinh/{phongTroId}")]
    [Authorize(Roles = "Admin,Chủ trọ,Nhân viên")]
    public async Task<ActionResult<HoaDonDTO>> TuDongTinhHoaDon(int phongTroId, [FromBody] DateTime thangNam)
    {
        // 1. Lấy thông tin phòng và dãy trọ
        var phongTro = await _context.PhongTros
            .Include(p => p.DayTro)
            .FirstOrDefaultAsync(p => p.Id == phongTroId);

        if (phongTro == null) return BadRequest(new { message = "Phòng trọ không tồn tại" });

        // 2. Kiểm tra hóa đơn tháng này đã tồn tại chưa
        var hoaDonDaCo = await _context.HoaDons.AnyAsync(h => h.PhongTroId == phongTroId && h.ThangNam.Month == thangNam.Month && h.ThangNam.Year == thangNam.Year);
        if (hoaDonDaCo) return BadRequest(new { message = $"Đã có hóa đơn tháng {thangNam:MM/yyyy}." });

        // 3. Lấy chỉ số Điện & Nước
        var chiSoDien = await _context.ChiSoCongTos.FirstOrDefaultAsync(c => c.PhongTroId == phongTroId && c.LoaiCongTo == "Điện" && c.ThangNam.Month == thangNam.Month && c.ThangNam.Year == thangNam.Year);
        var chiSoNuoc = await _context.ChiSoCongTos.FirstOrDefaultAsync(c => c.PhongTroId == phongTroId && c.LoaiCongTo == "Nước" && c.ThangNam.Month == thangNam.Month && c.ThangNam.Year == thangNam.Year);

        if (chiSoDien == null || chiSoNuoc == null) return BadRequest(new { message = "Chưa có chỉ số Điện hoặc Nước tháng này." });

        // 4. Lấy danh sách dịch vụ (Ưu tiên: Phòng > Dãy > Hệ thống)
        var rawServices = await _context.DichVus
            .Where(d => d.IsActive &&
                    (d.PhongTroId == phongTroId ||
                     (d.DayTroId == phongTro.DayTroId && d.PhongTroId == null) ||
                     (d.DayTroId == null && d.PhongTroId == null)))
            .ToListAsync();


        // Lọc trùng tên dịch vụ và lấy cái có độ ưu tiên cao nhất
        var finalServices = rawServices
            .GroupBy(d => d.TenDichVu.Trim().ToLower())
            .Select(g => g
                .OrderByDescending(d => d.PhongTroId.HasValue) 
                .ThenByDescending(d => d.DayTroId.HasValue)   
                .First()) 
            .ToList();

        decimal tienDien = 0, tienNuoc = 0, tienInternet = 0, tienVeSinh = 0, tienKhac = 0;
        var ghiChuBuilder = new System.Text.StringBuilder();
        ghiChuBuilder.Append($"Điện: {chiSoDien.SoTieuThu} số. Nước: {chiSoNuoc.SoTieuThu} khối. ");

        // 5. Tính tiền dựa trên Giá Mặc Định (Bỏ qua bậc thang)
        foreach (var dv in finalServices)
        {
            string ten = dv.TenDichVu.Trim().ToLower();
            decimal thanhTien = 0;

            if (ten == "điện")
            {
                thanhTien = (decimal)chiSoDien.SoTieuThu * dv.GiaMacDinh;
                tienDien = thanhTien;
            }
            else if (ten == "nước")
            {
                thanhTien = (decimal)chiSoNuoc.SoTieuThu * dv.GiaMacDinh;
                tienNuoc = thanhTien;
            }
            else
            {
                // Các dịch vụ cố định như Internet, Rác...
                thanhTien = dv.GiaMacDinh;

                if (ten.Contains("internet") || ten.Contains("mạng")) tienInternet = thanhTien;
                else if (ten.Contains("vệ sinh") || ten.Contains("rác")) tienVeSinh = thanhTien;
                else
                {
                    tienKhac += thanhTien;
                    ghiChuBuilder.Append($"{dv.TenDichVu}: {thanhTien:N0}. ");
                }
            }
        }

        // 6. Lấy công nợ cũ (Các hóa đơn tháng trước chưa trả)
        var congNoCu = await _context.HoaDons
            .Where(h => h.PhongTroId == phongTroId && h.TrangThai != "Đã thanh toán" && h.ThangNam < thangNam)
            .SumAsync(h => h.TongTien);

        // 7. Tổng cộng
        decimal tongTien = phongTro.GiaThue + tienDien + tienNuoc + tienInternet + tienVeSinh + tienKhac + congNoCu;

        var hoaDon = new HoaDon
        {
            MaHoaDon = $"HD{DateTime.Now:yyyyMMddHHmmss}{phongTroId}",
            PhongTroId = phongTroId,
            ThangNam = thangNam,
            TienPhong = phongTro.GiaThue,
            TienDien = tienDien,
            TienNuoc = tienNuoc,
            TienInternet = tienInternet,
            TienVeSinh = tienVeSinh,
            CongNoThangTruoc = congNoCu,
            TongTien = tongTien,
            TrangThai = "Chưa thanh toán",
            NgayTao = DateTime.Now,
            GhiChu = ghiChuBuilder.ToString().Trim()
        };

        _context.HoaDons.Add(hoaDon);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetHoaDon), new { id = hoaDon.Id }, new HoaDonDTO
        {
            Id = hoaDon.Id,
            MaHoaDon = hoaDon.MaHoaDon,
            TongTien = hoaDon.TongTien,
            TrangThai = hoaDon.TrangThai,
            GhiChu = hoaDon.GhiChu
        });
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateHoaDon(int id, UpdateHoaDonDTO dto)
    {
        var hoaDon = await _context.HoaDons.FindAsync(id);
        if (hoaDon == null)
        {
            return NotFound();
        }

        string trangThaiCu = hoaDon.TrangThai;

        hoaDon.ThangNam = dto.ThangNam;
        hoaDon.TienPhong = dto.TienPhong;
        hoaDon.TienDien = dto.TienDien;
        hoaDon.TienNuoc = dto.TienNuoc;
        hoaDon.TienInternet = dto.TienInternet;
        hoaDon.TienVeSinh = dto.TienVeSinh;
        hoaDon.CongNoThangTruoc = dto.CongNoThangTruoc;
        hoaDon.TongTien = dto.TienPhong + dto.TienDien + dto.TienNuoc + dto.TienInternet + dto.TienVeSinh + dto.CongNoThangTruoc;
        hoaDon.TrangThai = dto.TrangThai;
        hoaDon.NgayThanhToan = dto.NgayThanhToan;
        hoaDon.GhiChu = dto.GhiChu;

        hoaDon.TongTien = hoaDon.TienPhong + hoaDon.TienDien + hoaDon.TienNuoc
                    + hoaDon.TienInternet + hoaDon.TienVeSinh + hoaDon.CongNoThangTruoc;

        if (dto.TrangThai == "Đã thanh toán" && hoaDon.NgayThanhToan == null)
        {
            hoaDon.NgayThanhToan = DateTime.Now;
        }

        if (trangThaiCu != dto.TrangThai)
        {
            // Tìm hóa đơn của tháng liền kề sau đó (của cùng phòng này)
            var hoaDonThangSau = await _context.HoaDons
                .Where(h => h.PhongTroId == hoaDon.PhongTroId && h.ThangNam > hoaDon.ThangNam)
                .OrderBy(h => h.ThangNam)
                .FirstOrDefaultAsync();

            if (hoaDonThangSau != null)
            {
                // Nếu hóa đơn hiện tại chuyển thành "Đã thanh toán" -> Trừ bớt nợ ở tháng sau
                // Nếu hóa đơn hiện tại chuyển ngược về "Chưa thanh toán" -> Cộng thêm nợ vào tháng sau
                if (dto.TrangThai == "Đã thanh toán" && trangThaiCu != "Đã thanh toán")
                {
                    hoaDonThangSau.CongNoThangTruoc -= hoaDon.TongTien;
                }
                else if (dto.TrangThai != "Đã thanh toán" && trangThaiCu == "Đã thanh toán")
                {
                    hoaDonThangSau.CongNoThangTruoc += hoaDon.TongTien;
                }

                // Đảm bảo công nợ không âm (đề phòng sai sót dữ liệu)
                if (hoaDonThangSau.CongNoThangTruoc < 0) hoaDonThangSau.CongNoThangTruoc = 0;

                // Tính lại tổng tiền cho hóa đơn tháng sau
                hoaDonThangSau.TongTien = hoaDonThangSau.TienPhong + hoaDonThangSau.TienDien
                                        + hoaDonThangSau.TienNuoc + hoaDonThangSau.TienInternet
                                        + hoaDonThangSau.TienVeSinh + hoaDonThangSau.CongNoThangTruoc;

                _context.HoaDons.Update(hoaDonThangSau);
            }
        }

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteHoaDon(int id)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        // Tìm hóa đơn và kiểm tra quyền sở hữu thông qua Dãy trọ
        var hoaDon = await _context.HoaDons
            .Include(h => h.PhongTro).ThenInclude(p => p!.DayTro)
            .FirstOrDefaultAsync(h => h.Id == id);

        if (hoaDon == null) return NotFound();

        if (userRole == "Chủ trọ" && hoaDon.PhongTro?.DayTro?.UserId != userId)
        {
            return Forbid(); 
        }

        _context.HoaDons.Remove(hoaDon);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/thanh-toan")]
    [Authorize(Roles = "Admin,Chủ trọ,Nhân viên")]
    public async Task<IActionResult> ThanhToanHoaDon(int id, [FromBody] ThanhToanDTO dto)
    {
        var hoaDon = await _context.HoaDons.FindAsync(id);
        if (hoaDon == null)
        {
            return NotFound();
        }

        hoaDon.TrangThai = "Đã thanh toán";
        hoaDon.NgayThanhToan = DateTime.Now;
        hoaDon.PhuongThucThanhToan = dto.PhuongThucThanhToan;
        hoaDon.MaGiaoDich = dto.MaGiaoDich;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Thanh toán thành công" });
    }

    [HttpGet("chua-thanh-toan")]
    public async Task<ActionResult<IEnumerable<HoaDonDTO>>> GetHoaDonsChuaThanhToan()
    {
        var hoaDons = await _context.HoaDons
            .Include(h => h.PhongTro)
            .Where(h => h.TrangThai != "Đã thanh toán")
            .Select(h => new HoaDonDTO
            {
                Id = h.Id,
                MaHoaDon = h.MaHoaDon,
                PhongTroId = h.PhongTroId,
                SoPhong = h.PhongTro != null ? h.PhongTro.SoPhong : null,
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
                PhuongThucThanhToan = h.PhuongThucThanhToan,
                NgayTao = h.NgayTao,
                GhiChu = h.GhiChu
            })
            .OrderBy(h => h.ThangNam)
            .ToListAsync();

        return Ok(hoaDons);
    }

    [HttpPost("{id}/submit-proof")]
    [Authorize(Roles = "Người thuê")]
    public async Task<IActionResult> SubmitPaymentProof(int id, [FromBody] string imageUrl)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        var hoaDon = await _context.HoaDons
            .Include(h => h.PhongTro).ThenInclude(p => p.KhachThues)
            .FirstOrDefaultAsync(h => h.Id == id);

        if (hoaDon == null) return NotFound();

        // Check xem user có phải người thuê phòng này không
        var isTenant = hoaDon.PhongTro?.KhachThues?.Any(k => k.UserId == userId && k.NgayKetThucThue == null) ?? false;
        if (!isTenant) return Forbid();

        hoaDon.AnhMinhChung = imageUrl;
        hoaDon.TrangThai = "Chờ xác nhận"; 

        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã gửi ảnh minh chứng thành công" });
    }

    [HttpPost("{id}/delete-proof")]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<IActionResult> DeletePaymentProof(int id)
    {
        var hoaDon = await _context.HoaDons
            .Include(h => h.PhongTro).ThenInclude(p => p!.DayTro)
            .FirstOrDefaultAsync(h => h.Id == id);

        if (hoaDon == null) return NotFound(new { message = "Hóa đơn không tồn tại" });

        // Kiểm tra quyền chủ trọ
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userRole == "Chủ trọ")
        {
            // Chủ trọ chỉ được xóa của phòng mình
            if (hoaDon.PhongTro?.DayTro?.UserId != userId)
            {
                return Forbid();
            }
        }

        if (!string.IsNullOrEmpty(hoaDon.AnhMinhChung))
        {
            await _fileService.DeleteImageAsync(hoaDon.AnhMinhChung);
        }

        // Xóa đường dẫn ảnh 
        hoaDon.AnhMinhChung = null;

        // Reset trạng thái về "Chưa thanh toán"
        hoaDon.TrangThai = "Chưa thanh toán";

        // Xóa ngày thanh toán nếu lỡ set
        hoaDon.NgayThanhToan = null;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã xóa minh chứng và đặt lại trạng thái hóa đơn." });
    }

    [HttpPost("{id}/send-email")]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<IActionResult> SendEmailHoaDon(int id)
    {
        var hoaDon = await _context.HoaDons
            .Include(h => h.PhongTro).ThenInclude(p => p.KhachThues)
            .FirstOrDefaultAsync(h => h.Id == id);

        if (hoaDon == null) return NotFound();

        // Lấy email khách thuê (người đang ở)
        var khachEmail = hoaDon.PhongTro?.KhachThues?.FirstOrDefault(k => k.NgayKetThucThue == null)?.Email;
        if (string.IsNullOrEmpty(khachEmail))
            return BadRequest(new { message = "Khách thuê không có email hoặc phòng trống." });

        try
        {
            // Tạo PDF
            var pdfBytes = await _pdfService.GenerateInvoicePdfAsync(id);

            // Gửi Email
            var subject = $"Hóa đơn tiền nhà tháng {hoaDon.ThangNam:MM/yyyy} - Phòng {hoaDon.PhongTro?.SoPhong}";
            var body = $"<h3>Xin chào,</h3><p>Gửi bạn hóa đơn tiền nhà tháng {hoaDon.ThangNam:MM/yyyy}.</p><p>Tổng tiền: <b>{hoaDon.TongTien:N0} VNĐ</b></p><p>Vui lòng xem file đính kèm.</p>";

            await _emailService.SendEmailWithAttachmentAsync(khachEmail, subject, body, pdfBytes, $"HoaDon_{hoaDon.MaHoaDon}.pdf");

            return Ok(new { message = $"Đã gửi hóa đơn tới {khachEmail}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi gửi email: " + ex.Message });
        }
    }
}

