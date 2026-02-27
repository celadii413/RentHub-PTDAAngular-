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
public class DayTroController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DayTroController(ApplicationDbContext context)
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
    public async Task<ActionResult<IEnumerable<DayTroDTO>>> GetDayTros()
    {
        var userIdString = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (string.IsNullOrEmpty(userIdString))
        {
            return Unauthorized(new { message = "Không tìm thấy thông tin người dùng" });
        }

        var userId = int.Parse(userIdString);

        var thangNay = DateTime.Now;

        var dayTros = await _context.DayTros
            .Where(d => d.UserId == userId)
            .OrderByDescending(d => d.NgayTao)
            .Select(d => new DayTroDTO
            {
                Id = d.Id,
                TenDayTro = d.TenDayTro,
                DiaChi = d.DiaChi,
                SoTang = d.SoTang,
                SoPhongMoiTang = d.SoPhongMoiTang,
                MoTa = d.MoTa,
                NgayTao = d.NgayTao,
                TongSoPhong = _context.PhongTros.Count(p => p.DayTroId == d.Id),

                TongDienThangNay = _context.ChiSoCongTos
                    .Where(c => c.PhongTro.DayTroId == d.Id && c.LoaiCongTo == "Điện"
                                && c.ThangNam.Month == thangNay.Month && c.ThangNam.Year == thangNay.Year)
                    .Sum(c => c.SoTieuThu),

                TongNuocThangNay = _context.ChiSoCongTos
                    .Where(c => c.PhongTro.DayTroId == d.Id && c.LoaiCongTo == "Nước"
                                && c.ThangNam.Month == thangNay.Month && c.ThangNam.Year == thangNay.Year)
                    .Sum(c => c.SoTieuThu)
            })
            .ToListAsync();

        return Ok(dayTros);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DayTroDTO>> GetDayTro(int id)
    {
        var query = _context.DayTros.Where(d => d.Id == id);
        
        // Nếu là chủ trọ, chỉ được xem nhà trọ của mình
        if (IsOwner())
        {
            var dayTroId = await GetUserDayTroIdAsync();
            if (!dayTroId.HasValue || dayTroId.Value != id)
            {
                return Forbid();
            }
        }

        var dayTro = await query
            .Select(d => new DayTroDTO
            {
                Id = d.Id,
                TenDayTro = d.TenDayTro,
                DiaChi = d.DiaChi,
                SoTang = d.SoTang,
                SoPhongMoiTang = d.SoPhongMoiTang,
                MoTa = d.MoTa,
                NgayTao = d.NgayTao,
                TongSoPhong = d.PhongTros != null ? d.PhongTros.Count : 0
            })
            .FirstOrDefaultAsync();

        if (dayTro == null)
            return NotFound();

        return Ok(dayTro);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<ActionResult<DayTroDTO>> CreateDayTro(CreateDayTroDTO dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        int? userId = null;

        if (userIdClaim != null && int.TryParse(userIdClaim.Value, out int parsedId))
        {
            userId = parsedId;
        }

        var dayTro = new DayTro
        {
            TenDayTro = dto.TenDayTro,
            DiaChi = dto.DiaChi,
            SoTang = dto.SoTang,
            SoPhongMoiTang = dto.SoPhongMoiTang,
            MoTa = dto.MoTa,
            UserId = userId,
            NgayTao = DateTime.Now
        };

        _context.DayTros.Add(dayTro);
        await _context.SaveChangesAsync();

        var result = new DayTroDTO
        {
            Id = dayTro.Id,
            TenDayTro = dayTro.TenDayTro,
            DiaChi = dayTro.DiaChi,
            SoTang = dayTro.SoTang,
            SoPhongMoiTang = dayTro.SoPhongMoiTang,
            MoTa = dayTro.MoTa,
            NgayTao = dayTro.NgayTao,
            TongSoPhong = 0
        };

        return CreatedAtAction(nameof(GetDayTro), new { id = dayTro.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<IActionResult> UpdateDayTro(int id, UpdateDayTroDTO dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var dayTro = await _context.DayTros.FirstOrDefaultAsync(d => d.Id == id && d.UserId == userId);

        if (dayTro == null) return Forbid();

        dayTro.TenDayTro = dto.TenDayTro;
        dayTro.DiaChi = dto.DiaChi;
        dayTro.SoTang = dto.SoTang;
        dayTro.SoPhongMoiTang = dto.SoPhongMoiTang;
        dayTro.MoTa = dto.MoTa;
        dayTro.NgayCapNhat = DateTime.Now;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<IActionResult> DeleteDayTro(int id)
    {
        try
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            // Tìm dãy trọ đảm bảo đúng quyền sở hữu
            var dayTro = await _context.DayTros
                .FirstOrDefaultAsync(d => d.Id == id && (d.UserId == userId || User.IsInRole("Admin")));

            if (dayTro == null) return NotFound(new { message = "Không tìm thấy dãy trọ hoặc bạn không có quyền." });

            // KIỂM TRA RÀNG BUỘC: Nếu còn phòng trọ thì không cho xóa
            var hasRooms = await _context.PhongTros.AnyAsync(p => p.DayTroId == id);
            if (hasRooms)
            {
                return BadRequest(new { message = "Không thể xóa dãy trọ vì vẫn còn các phòng trọ bên trong. Hãy xóa các phòng trước." });
            }

            var hasExpenses = await _context.ChiPhis.AnyAsync(c => c.DayTroId == id);
            if (hasExpenses)
            {
                return BadRequest(new { message = "Không thể xóa vì dãy trọ này có dữ liệu chi phí liên quan." });
            }

            _context.DayTros.Remove(dayTro);
            await _context.SaveChangesAsync();
            return NoContent();
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi hệ thống: " + ex.Message });
        }
    }
}

