using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLPhongTro.API.Data;
using QLPhongTro.API.DTOs;
using QLPhongTro.API.Models;
using System.Security.Claims;

namespace QLPhongTro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class KhachThueController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public KhachThueController(ApplicationDbContext context)
    {
        _context = context;
    }

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

    private bool IsOwner() => User.FindFirst(ClaimTypes.Role)?.Value == "Chủ trọ";

    [HttpGet]
    public async Task<ActionResult<IEnumerable<KhachThueDTO>>> GetKhachThues([FromQuery] string? search = null)
    {
        var query = _context.KhachThues.Include(k => k.PhongTro).AsQueryable();

        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (userDayTroId.HasValue)
                query = query.Where(k => k.PhongTro != null && k.PhongTro.DayTroId == userDayTroId.Value);
            else
                return Ok(new List<KhachThueDTO>());
        }

        if (!string.IsNullOrWhiteSpace(search))
        {
            string keyword = search.Trim().ToLower();

            // Tìm kiếm trên nhiều trường: Tên, SĐT, Email, CCCD, Tên Phòng
            query = query.Where(k =>
                (k.HoTen != null && k.HoTen.ToLower().Contains(keyword)) ||
                (k.SoDienThoai != null && k.SoDienThoai.Contains(keyword)) ||
                (k.Email != null && k.Email.ToLower().Contains(keyword)) ||
                (k.CCCD != null && k.CCCD.Contains(keyword)) ||
                (k.PhongTro != null && k.PhongTro.SoPhong.ToLower().Contains(keyword))
            );
        }

        var khachThues = await query
            .OrderByDescending(k => k.NgayBatDauThue) 
            .Select(k => new KhachThueDTO
            {
                Id = k.Id,
                HoTen = k.HoTen,
                SoDienThoai = k.SoDienThoai,
                Email = k.Email,
                CCCD = k.CCCD,
                NgaySinh = k.NgaySinh,
                GioiTinh = k.GioiTinh,
                DiaChiThuongTru = k.DiaChiThuongTru,
                NgayBatDauThue = k.NgayBatDauThue,
                NgayKetThucThue = k.NgayKetThucThue,
                PhongTroId = k.PhongTroId,
                SoPhong = k.PhongTro != null ? k.PhongTro.SoPhong : null
            })
            .ToListAsync();

        return Ok(khachThues);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<KhachThueDTO>> GetKhachThue(int id)
    {
        var query = _context.KhachThues.Include(k => k.PhongTro).Where(k => k.Id == id);
        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (userDayTroId.HasValue) query = query.Where(k => k.PhongTro != null && k.PhongTro.DayTroId == userDayTroId.Value);
            else return Forbid();
        }
        var khachThue = await query.Select(k => new KhachThueDTO { Id = k.Id, HoTen = k.HoTen, SoDienThoai = k.SoDienThoai, Email = k.Email, CCCD = k.CCCD, NgaySinh = k.NgaySinh, GioiTinh = k.GioiTinh, DiaChiThuongTru = k.DiaChiThuongTru, NgayBatDauThue = k.NgayBatDauThue, NgayKetThucThue = k.NgayKetThucThue, PhongTroId = k.PhongTroId, SoPhong = k.PhongTro != null ? k.PhongTro.SoPhong : null }).FirstOrDefaultAsync();
        if (khachThue == null) return NotFound();
        return Ok(khachThue);
    }

    [HttpPost]
    public async Task<ActionResult<KhachThueDTO>> CreateKhachThue(CreateKhachThueDTO dto)
    {
        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            if (await _context.KhachThues.AnyAsync(k => k.Email == dto.Email && k.NgayKetThucThue == null))
                return BadRequest(new { message = "Email này đang được sử dụng bởi khách thuê khác." });
        }

        var phongTro = await _context.PhongTros.Include(p => p.DayTro).FirstOrDefaultAsync(p => p.Id == dto.PhongTroId);
        if (phongTro == null) return BadRequest(new { message = "Phòng trọ không tồn tại" });

        var soNguoiHienTai = await _context.KhachThues
        .CountAsync(k => k.PhongTroId == dto.PhongTroId && k.NgayKetThucThue == null);

        if (soNguoiHienTai >= phongTro.GioiHanSoNguoi)
        {
            return BadRequest(new { message = $"Phòng {phongTro.SoPhong} đã đạt giới hạn {phongTro.GioiHanSoNguoi} người. Không thể thêm người mới." });
        }

        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (!userDayTroId.HasValue || phongTro.DayTroId != userDayTroId.Value) return Forbid();
        }

        var khachThue = new KhachThue
        {
            HoTen = dto.HoTen,
            SoDienThoai = dto.SoDienThoai,
            Email = dto.Email,
            CCCD = dto.CCCD,
            NgaySinh = dto.NgaySinh,
            GioiTinh = dto.GioiTinh,
            DiaChiThuongTru = dto.DiaChiThuongTru,
            NgayBatDauThue = dto.NgayBatDauThue,
            PhongTroId = dto.PhongTroId,
            NgayTao = DateTime.Now
        };

        if (!string.IsNullOrEmpty(dto.Email))
        {
            var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Email == dto.Email);
            if (existingUser != null) khachThue.UserId = existingUser.Id;
        }

        _context.KhachThues.Add(khachThue);
        phongTro.TrangThai = "Đã thuê";
        await _context.SaveChangesAsync();

        var result = new KhachThueDTO { Id = khachThue.Id, HoTen = khachThue.HoTen, SoDienThoai = khachThue.SoDienThoai, Email = khachThue.Email, CCCD = khachThue.CCCD, NgaySinh = khachThue.NgaySinh, GioiTinh = khachThue.GioiTinh, DiaChiThuongTru = khachThue.DiaChiThuongTru, NgayBatDauThue = khachThue.NgayBatDauThue, NgayKetThucThue = khachThue.NgayKetThucThue, PhongTroId = khachThue.PhongTroId, SoPhong = phongTro.SoPhong };
        return CreatedAtAction(nameof(GetKhachThue), new { id = khachThue.Id }, result);
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateKhachThue(int id, UpdateKhachThueDTO dto)
    {
        var khachThue = await _context.KhachThues.FindAsync(id);
        if (khachThue == null) return NotFound();

        if (!string.IsNullOrWhiteSpace(dto.Email))
        {
            if (await _context.KhachThues.AnyAsync(k => k.Id != id && k.Email == dto.Email && k.NgayKetThucThue == null))
                return BadRequest(new { message = "Email này đã được sử dụng." });
        }

        var phongTroCu = await _context.PhongTros.FindAsync(khachThue.PhongTroId);
        var phongTroMoi = await _context.PhongTros.FindAsync(dto.PhongTroId);
        if (phongTroMoi == null) return BadRequest(new { message = "Phòng trọ không tồn tại" });

        if (phongTroCu?.Id != dto.PhongTroId) // Nếu là chuyển phòng hoặc thay phòng mới
        {
            if (phongTroMoi == null) return BadRequest(new { message = "Phòng trọ mới không tồn tại" });

            var soNguoiHienTaiMoi = await _context.KhachThues
                .CountAsync(k => k.PhongTroId == dto.PhongTroId &&
                                 k.NgayKetThucThue == null &&
                                 k.Id != id); // Không tính bản thân KhachThue này

            if (soNguoiHienTaiMoi >= phongTroMoi.GioiHanSoNguoi)
            {
                return BadRequest(new { message = $"Phòng {phongTroMoi.SoPhong} đã đạt giới hạn {phongTroMoi.GioiHanSoNguoi} người. Không thể chuyển vào." });
            }
        }

        khachThue.HoTen = dto.HoTen; khachThue.SoDienThoai = dto.SoDienThoai; khachThue.Email = dto.Email;
        khachThue.CCCD = dto.CCCD; khachThue.NgaySinh = dto.NgaySinh; khachThue.GioiTinh = dto.GioiTinh;
        khachThue.DiaChiThuongTru = dto.DiaChiThuongTru; khachThue.NgayBatDauThue = dto.NgayBatDauThue;
        khachThue.NgayKetThucThue = dto.NgayKetThucThue; khachThue.PhongTroId = dto.PhongTroId;

        // Cập nhật trạng thái phòng cũ/mới
        if (phongTroCu != null && phongTroCu.Id != dto.PhongTroId)
        {
            var soKhachThue = await _context.KhachThues.CountAsync(k => k.PhongTroId == phongTroCu.Id && k.NgayKetThucThue == null);
            if (soKhachThue <= 1) phongTroCu.TrangThai = "Trống";
        }
        if (dto.NgayKetThucThue == null) phongTroMoi.TrangThai = "Đã thuê";

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<IActionResult> DeleteKhachThue(int id)
    {
        var khachThue = await _context.KhachThues.FindAsync(id);
        if (khachThue == null) return NotFound();

        var dangCoHopDong = await _context.HopDongs
            .AnyAsync(h => h.KhachThueId == id && h.TrangThai == "Đang hiệu lực");

        if (dangCoHopDong)
        {
            return BadRequest(new { message = "Không thể xóa khách thuê này vì đang có Hợp đồng hiệu lực. Vui lòng kết thúc hợp đồng trước." });
        }

        var phongTro = await _context.PhongTros.FindAsync(khachThue.PhongTroId);
        _context.KhachThues.Remove(khachThue);

        if (phongTro != null)
        {
            // Logic cập nhật trạng thái phòng khi xóa khách 
            var conNguoiO = await _context.KhachThues.AnyAsync(k => k.PhongTroId == phongTro.Id && k.Id != id && k.NgayKetThucThue == null);
            if (!conNguoiO) phongTro.TrangThai = "Trống";
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/tra-phong")]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<IActionResult> TraPhong(int id, TraPhongDTO dto)
    {
        var khachThue = await _context.KhachThues.FindAsync(id);
        if (khachThue == null) return NotFound();

        // check nợ
        var coNoXau = await _context.HoaDons
            .AnyAsync(h => h.PhongTroId == khachThue.PhongTroId &&
                           h.TrangThai != "Đã thanh toán" &&
                           h.ThangNam >= khachThue.NgayBatDauThue);
        if (coNoXau) return BadRequest(new { message = "Khách thuê còn hóa đơn chưa thanh toán. Vui lòng thanh toán trước khi trả phòng." });

        // cập nhật trả phòng và cọc
        khachThue.NgayKetThucThue = dto.NgayTraPhong ?? DateTime.Now;
        khachThue.TrangThaiCoc = dto.TrangThaiCoc;

        var phongTro = await _context.PhongTros.FindAsync(khachThue.PhongTroId);
        if (phongTro != null)
        {
            // Kiểm tra còn ai khác đang thuê không
            var conNguoiO = await _context.KhachThues.AnyAsync(k => k.PhongTroId == phongTro.Id && k.Id != id && k.NgayKetThucThue == null);
            if (!conNguoiO) phongTro.TrangThai = "Trống";
        }

        var hopDong = await _context.HopDongs.FirstOrDefaultAsync(h => h.KhachThueId == id && h.TrangThai == "Đang hiệu lực");
        if (hopDong != null)
        {
            hopDong.TrangThai = "Đã kết thúc";
            hopDong.NgayCapNhat = DateTime.Now;
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Trả phòng thành công" });
    }

    [HttpPost("{id}/chuyen-phong")]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<IActionResult> ChuyenPhong(int id, ChuyenPhongDTO dto)
    {
        var khachThue = await _context.KhachThues.FindAsync(id);
        if (khachThue == null) return NotFound();
        var phongTroCu = await _context.PhongTros.FindAsync(khachThue.PhongTroId);
        var phongTroMoi = await _context.PhongTros.FindAsync(dto.PhongTroMoiId);
        if (phongTroMoi == null) return BadRequest(new { message = "Phòng trọ mới không tồn tại" });
        if (phongTroMoi.TrangThai == "Đã thuê") return BadRequest(new { message = "Phòng trọ mới đã có người thuê" });

        var lichSu = new LichSuChuyenPhong { KhachThueId = id, PhongTroCuId = khachThue.PhongTroId, PhongTroMoiId = dto.PhongTroMoiId, NgayChuyen = DateTime.Now, LyDo = dto.LyDo, GhiChu = dto.GhiChu };
        _context.LichSuChuyenPhongs.Add(lichSu);

        if (phongTroCu != null)
        {
            var soKhachThue = await _context.KhachThues.CountAsync(k => k.PhongTroId == phongTroCu.Id && k.NgayKetThucThue == null);
            if (soKhachThue <= 1) phongTroCu.TrangThai = "Trống";
        }
        phongTroMoi.TrangThai = "Đã thuê";
        khachThue.PhongTroId = dto.PhongTroMoiId;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Chuyển phòng thành công" });
    }

    [HttpGet("{id}/lich-su-chuyen-phong")]
    public async Task<ActionResult<IEnumerable<LichSuChuyenPhongDTO>>> GetLichSuChuyenPhong(int id)
    {
        var lichSu = await _context.LichSuChuyenPhongs.Where(l => l.KhachThueId == id).OrderByDescending(l => l.NgayChuyen).Select(l => new LichSuChuyenPhongDTO { Id = l.Id, PhongTroCuId = l.PhongTroCuId, PhongTroMoiId = l.PhongTroMoiId, NgayChuyen = l.NgayChuyen, LyDo = l.LyDo, GhiChu = l.GhiChu }).ToListAsync();
        return Ok(lichSu);
    }
}