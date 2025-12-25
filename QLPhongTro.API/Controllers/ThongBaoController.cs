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
public class ThongBaoController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    public ThongBaoController(ApplicationDbContext context) { _context = context; }

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

    private bool IsAdmin() => User.FindFirst(ClaimTypes.Role)?.Value == "Admin";
    private bool IsOwner() => User.FindFirst(ClaimTypes.Role)?.Value == "Chủ trọ";

    // 1. LẤY THÔNG BÁO CHO NGƯỜI THUÊ (Chỉ lấy của nhà họ đang ở)
    [HttpGet("tenant")]
    public async Task<ActionResult<IEnumerable<ThongBaoDTO>>> GetThongBaosForTenant()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var khachThue = await _context.KhachThues.Include(k => k.PhongTro)
            .FirstOrDefaultAsync(k => k.UserId == userId && k.NgayKetThucThue == null);

        if (khachThue == null || khachThue.PhongTro == null) return Ok(new List<ThongBaoDTO>());

        int phongTroId = khachThue.PhongTroId;
        int dayTroId = khachThue.PhongTro.DayTroId;

        // CHỈ lấy tin của Dãy trọ hoặc đúng Phòng đó (Bỏ tin hệ thống DayTroId == null)
        var thongBaos = await _context.ThongBaos
            .Where(t => t.DayTroId == dayTroId || t.PhongTroId == phongTroId)
            .OrderByDescending(t => t.NgayTao)
            .ToListAsync();

        var daDocIds = await _context.ThongBaoDaDocs.Where(d => d.UserId == userId).Select(d => d.ThongBaoId).ToListAsync();

        return Ok(thongBaos.Select(t => new ThongBaoDTO { 
            Id = t.Id, TieuDe = t.TieuDe, NoiDung = t.NoiDung, 
            DayTroId = t.DayTroId, PhongTroId = t.PhongTroId, 
            NgayTao = t.NgayTao, DaDoc = daDocIds.Contains(t.Id) 
        }));
    }

    // 2. LẤY THÔNG BÁO CHO CHỦ TRỌ (Chỉ lấy của nhà họ quản lý)
    [HttpGet("owner")]
    public async Task<ActionResult<IEnumerable<ThongBaoDTO>>> GetThongBaosForOwner()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var query = _context.ThongBaos.AsQueryable();

        if (IsOwner())
        {
            var dayTroId = await GetUserDayTroIdAsync();
            if (!dayTroId.HasValue) return Ok(new List<ThongBaoDTO>());
            
            // CHỈ lấy tin thuộc nhà trọ của mình
            query = query.Where(t => t.DayTroId == dayTroId.Value);
        }

        var thongBaos = await query.OrderByDescending(t => t.NgayTao).ToListAsync();
        return Ok(thongBaos.Select(t => new ThongBaoDTO { 
            Id = t.Id, TieuDe = t.TieuDe, NoiDung = t.NoiDung, 
            DayTroId = t.DayTroId, PhongTroId = t.PhongTroId, 
            NgayTao = t.NgayTao, DaDoc = false 
        }));
    }

    // 3. TẠO THÔNG BÁO (Tự động gán ID nhà trọ của chủ trọ)
    [HttpPost]
    [Authorize(Roles = "Chủ trọ,Admin")]
    public async Task<ActionResult<ThongBaoDTO>> CreateThongBao([FromBody] CreateThongBaoDTO dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        int? dayTroId = dto.DayTroId;

        if (IsOwner())
        {
            var ownerDayId = await GetUserDayTroIdAsync();
            if (!ownerDayId.HasValue) return BadRequest(new { message = "Bạn chưa có thông tin Dãy trọ." });
            dayTroId = ownerDayId.Value; // Ép buộc gán vào nhà của chủ trọ này
        }

        var thongBao = new ThongBao { 
            TieuDe = dto.TieuDe, NoiDung = dto.NoiDung, 
            DayTroId = dayTroId, PhongTroId = dto.PhongTroId, 
            NguoiTaoId = userId, NgayTao = DateTime.Now 
        };

        _context.ThongBaos.Add(thongBao);
        await _context.SaveChangesAsync();

        return Ok(new ThongBaoDTO { 
            Id = thongBao.Id, TieuDe = thongBao.TieuDe, NoiDung = thongBao.NoiDung, 
            DayTroId = thongBao.DayTroId, PhongTroId = thongBao.PhongTroId, 
            NgayTao = thongBao.NgayTao, DaDoc = false 
        });
    }

    // 4. XOÁ THÔNG BÁO (Chỉ xoá được tin của nhà mình)
    [HttpDelete("{id}")]
    [Authorize(Roles = "Chủ trọ,Admin")]
    public async Task<IActionResult> DeleteThongBao(int id)
    {
        var thongBao = await _context.ThongBaos.FindAsync(id);
        if (thongBao == null) return NotFound();

        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            // Nếu tin không thuộc nhà mình thì không cho xoá
            if (thongBao.DayTroId != userDayTroId) 
                return StatusCode(403, new { message = "Bạn không có quyền xóa tin của nhà trọ khác." });
        }

        var daDocs = await _context.ThongBaoDaDocs.Where(d => d.ThongBaoId == id).ToListAsync();
        _context.ThongBaoDaDocs.RemoveRange(daDocs);
        _context.ThongBaos.Remove(thongBao);
        await _context.SaveChangesAsync();
        
        return Ok(new { message = "Xóa thành công" });
    }
}