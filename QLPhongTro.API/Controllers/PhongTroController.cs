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
public class PhongTroController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public PhongTroController(ApplicationDbContext context)
    {
        _context = context;
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
    public async Task<ActionResult<IEnumerable<PhongTroDTO>>> GetPhongTros([FromQuery] int? dayTroId, [FromQuery] int? tang, [FromQuery] string? trangThai)
    {
        var query = _context.PhongTros.Include(p => p.DayTro).AsQueryable();

        // Nếu là chủ trọ, tự động filter theo DayTro của mình
        if (IsOwner())
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            query = query.Where(p => p.DayTro.UserId == userId);
        }

        else if (dayTroId.HasValue)
        {
            // Admin có thể filter theo dayTroId
            query = query.Where(p => p.DayTroId == dayTroId.Value);
        }

        if (tang.HasValue)
            query = query.Where(p => p.Tang == tang.Value);

        if (!string.IsNullOrEmpty(trangThai))
            query = query.Where(p => p.TrangThai == trangThai);

        var phongTros = await query
            .Select(p => new PhongTroDTO
            {
                Id = p.Id,
                SoPhong = p.SoPhong,
                TenPhong = p.TenPhong,
                Tang = p.Tang,
                GiaThue = p.GiaThue,
                TienCoc = p.TienCoc,
                DienTich = p.DienTich,
                MoTa = p.MoTa,
                TrangThai = p.TrangThai,
                DayTroId = p.DayTroId,
                TenDayTro = p.DayTro != null ? p.DayTro.TenDayTro : null,
                NgayTao = p.NgayTao,
                SoKhachThue = p.KhachThues != null ? p.KhachThues.Count(k => k.NgayKetThucThue == null) : 0,
                HinhAnh1 = p.HinhAnh1,
                HinhAnh2 = p.HinhAnh2,
                HinhAnh3 = p.HinhAnh3,
                GioiHanSoNguoi = p.GioiHanSoNguoi,
                ChiSoDienMoiNhat = _context.ChiSoCongTos
                .Where(c => c.PhongTroId == p.Id && c.LoaiCongTo == "Điện")
                .OrderByDescending(c => c.ThangNam).Select(c => c.ChiSoMoi).FirstOrDefault(),
                ChiSoNuocMoiNhat = _context.ChiSoCongTos
                .Where(c => c.PhongTroId == p.Id && c.LoaiCongTo == "Nước")
                .OrderByDescending(c => c.ThangNam).Select(c => c.ChiSoMoi).FirstOrDefault()
            })
            .ToListAsync();

        return Ok(phongTros);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<PhongTroDTO>> GetPhongTro(int id)
    {
        var query = _context.PhongTros
            .Include(p => p.DayTro)
            .Where(p => p.Id == id);

        // Nếu là chủ trọ, chỉ được xem phòng trong nhà trọ của mình
        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (userDayTroId.HasValue)
            {
                query = query.Where(p => p.DayTroId == userDayTroId.Value);
            }
            else
            {
                return Forbid();
            }
        }

        var phongTro = await query
            .Select(p => new PhongTroDTO
            {
                Id = p.Id,
                SoPhong = p.SoPhong,
                TenPhong = p.TenPhong,
                Tang = p.Tang,
                GiaThue = p.GiaThue,
                TienCoc = p.TienCoc,
                DienTich = p.DienTich,
                MoTa = p.MoTa,
                TrangThai = p.TrangThai,
                DayTroId = p.DayTroId,
                TenDayTro = p.DayTro != null ? p.DayTro.TenDayTro : null,
                NgayTao = p.NgayTao,
                SoKhachThue = p.KhachThues != null ? p.KhachThues.Count(k => k.NgayKetThucThue == null) : 0,
                HinhAnh1 = p.HinhAnh1,
                HinhAnh2 = p.HinhAnh2,
                HinhAnh3 = p.HinhAnh3,
                GioiHanSoNguoi = p.GioiHanSoNguoi,
                ChiSoDienMoiNhat = _context.ChiSoCongTos
                .Where(c => c.PhongTroId == p.Id && c.LoaiCongTo == "Điện")
                .OrderByDescending(c => c.ThangNam).Select(c => c.ChiSoMoi).FirstOrDefault(),
                ChiSoNuocMoiNhat = _context.ChiSoCongTos
                .Where(c => c.PhongTroId == p.Id && c.LoaiCongTo == "Nước")
                .OrderByDescending(c => c.ThangNam).Select(c => c.ChiSoMoi).FirstOrDefault()
            })
            .FirstOrDefaultAsync();

        if (phongTro == null)
        {
            return NotFound();
        }

        return Ok(phongTro);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<ActionResult<PhongTroDTO>> CreatePhongTro(CreatePhongTroDTO dto)
    {
        // Nếu là chủ trọ, tự động gán DayTroId của mình
        if (IsOwner())
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var isMine = await _context.DayTros.AnyAsync(d => d.Id == dto.DayTroId && d.UserId == userId);
            if (!isMine) return BadRequest(new { message = "Dãy trọ không hợp lệ hoặc không thuộc quyền quản lý của bạn." });
        }

        if (await _context.PhongTros.AnyAsync(p => p.SoPhong == dto.SoPhong && p.DayTroId == dto.DayTroId))
        {
            return BadRequest(new { message = "Số phòng đã tồn tại trong nhà trọ này" });
        }

        if (!await _context.DayTros.AnyAsync(d => d.Id == dto.DayTroId))
        {
            return BadRequest(new { message = "Dãy trọ không tồn tại" });
        }

        var phongTro = new PhongTro
        {
            SoPhong = dto.SoPhong,
            TenPhong = dto.TenPhong,
            Tang = dto.Tang,
            GiaThue = dto.GiaThue,
            TienCoc = dto.TienCoc,
            DienTich = dto.DienTich,
            MoTa = dto.MoTa,
            TrangThai = dto.TrangThai,
            DayTroId = dto.DayTroId,
            NgayTao = DateTime.Now,
            GioiHanSoNguoi = dto.GioiHanSoNguoi
        };

        _context.PhongTros.Add(phongTro);
        await _context.SaveChangesAsync();

        var dayTro = await _context.DayTros.FindAsync(dto.DayTroId);
        var result = new PhongTroDTO
        {
            Id = phongTro.Id,
            SoPhong = phongTro.SoPhong,
            TenPhong = phongTro.TenPhong,
            Tang = phongTro.Tang,
            GiaThue = phongTro.GiaThue,
            TienCoc = phongTro.TienCoc,
            DienTich = phongTro.DienTich,
            MoTa = phongTro.MoTa,
            TrangThai = phongTro.TrangThai,
            DayTroId = phongTro.DayTroId,
            TenDayTro = dayTro?.TenDayTro,
            NgayTao = phongTro.NgayTao,
            SoKhachThue = 0,
            GioiHanSoNguoi = phongTro.GioiHanSoNguoi
        };

        return CreatedAtAction(nameof(GetPhongTro), new { id = phongTro.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<IActionResult> UpdatePhongTro(int id, UpdatePhongTroDTO dto)
    {
        var phongTro = await _context.PhongTros.Include(p => p.DayTro).FirstOrDefaultAsync(p => p.Id == id);
        if (phongTro == null)
        {
            return NotFound();
        }

        // Nếu là chủ trọ, chỉ được sửa phòng trong nhà trọ của mình
        if (IsOwner())
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            if (phongTro.DayTro.UserId != userId) return Forbid();
            if (phongTro.DayTroId != dto.DayTroId)
            {
                var isNewDayMine = await _context.DayTros.AnyAsync(d => d.Id == dto.DayTroId && d.UserId == userId);
                if (!isNewDayMine) return BadRequest(new { message = "Dãy trọ mới không hợp lệ." });
            }
        }

        if (!await _context.DayTros.AnyAsync(d => d.Id == dto.DayTroId))
        {
            return BadRequest(new { message = "Dãy trọ không tồn tại" });
        }

        phongTro.TenPhong = dto.TenPhong;
        phongTro.Tang = dto.Tang;
        phongTro.GiaThue = dto.GiaThue;
        phongTro.TienCoc = dto.TienCoc;
        phongTro.DienTich = dto.DienTich;
        phongTro.MoTa = dto.MoTa;
        phongTro.TrangThai = dto.TrangThai;
        phongTro.DayTroId = dto.DayTroId;
        phongTro.HinhAnh1 = dto.HinhAnh1;
        phongTro.HinhAnh2 = dto.HinhAnh2;
        phongTro.HinhAnh3 = dto.HinhAnh3;
        phongTro.NgayCapNhat = DateTime.Now;
        phongTro.GioiHanSoNguoi = dto.GioiHanSoNguoi;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<IActionResult> DeletePhongTro(int id)
    {
        var phongTro = await _context.PhongTros.FindAsync(id);
        if (phongTro == null)
        {
            return NotFound();
        }

        // Nếu là chủ trọ, chỉ được xóa phòng trong nhà trọ của mình
        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (!userDayTroId.HasValue || phongTro.DayTroId != userDayTroId.Value)
            {
                return Forbid();
            }
        }

        var coKhach = await _context.KhachThues.AnyAsync(k => k.PhongTroId == id);
        var coHopDong = await _context.HopDongs.AnyAsync(h => h.PhongTroId == id);
        var coHoaDon = await _context.HoaDons.AnyAsync(h => h.PhongTroId == id);

        if (coKhach || coHopDong || coHoaDon)
        {
            return BadRequest(new { message = "Không thể xóa phòng này vì đang có dữ liệu liên quan (Khách, Hợp đồng hoặc Hóa đơn). Hãy xóa các dữ liệu đó trước." });
        }

        _context.PhongTros.Remove(phongTro);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("by-daytro/{dayTroId}")]
    public async Task<ActionResult<IEnumerable<PhongTroDTO>>> GetPhongTrosByDayTro(int dayTroId)
    {
        var query = _context.PhongTros
            .Include(p => p.DayTro)
            .Where(p => p.DayTroId == dayTroId);

        // Nếu là chủ trọ, chỉ được xem phòng trong nhà trọ của mình
        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (!userDayTroId.HasValue || dayTroId != userDayTroId.Value)
            {
                return Forbid();
            }
        }

        var phongTros = await query
            .OrderBy(p => p.Tang)
            .ThenBy(p => p.SoPhong)
            .Select(p => new PhongTroDTO
            {
                Id = p.Id,
                SoPhong = p.SoPhong,
                TenPhong = p.TenPhong,
                Tang = p.Tang,
                GiaThue = p.GiaThue,
                TienCoc = p.TienCoc,
                DienTich = p.DienTich,
                MoTa = p.MoTa,
                TrangThai = p.TrangThai,
                DayTroId = p.DayTroId,
                TenDayTro = p.DayTro != null ? p.DayTro.TenDayTro : null,
                NgayTao = p.NgayTao,
                SoKhachThue = p.KhachThues != null ? p.KhachThues.Count(k => k.NgayKetThucThue == null) : 0,
                HinhAnh1 = p.HinhAnh1,
                HinhAnh2 = p.HinhAnh2,
                HinhAnh3 = p.HinhAnh3
            })
            .ToListAsync();

        return Ok(phongTros);
    }

}

