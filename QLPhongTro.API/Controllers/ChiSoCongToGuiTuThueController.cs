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
public class ChiSoCongToGuiTuThueController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    public ChiSoCongToGuiTuThueController(ApplicationDbContext context) { _context = context; }

    [HttpPost]
    [Authorize(Roles = "Người thuê")]
    public async Task<ActionResult<ChiSoCongToGuiTuThueDTO>> SubmitMeterReading([FromBody] CreateChiSoCongToGuiTuThueDTO dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();
        var userId = int.Parse(userIdClaim.Value);

        var khachThue = await _context.KhachThues.FirstOrDefaultAsync(k => k.UserId == userId && k.NgayKetThucThue == null);
        if (khachThue == null) return BadRequest(new { message = "Bạn không thuê phòng nào hoặc đã trả phòng" });
        if (khachThue.PhongTroId != dto.PhongTroId) return Forbid();

        var chiSoGui = new ChiSoCongToGuiTuThue { PhongTroId = dto.PhongTroId, KhachThueId = khachThue.Id, LoaiCongTo = dto.LoaiCongTo, ChiSo = dto.ChiSo, ThangNam = dto.ThangNam, AnhCongTo = dto.AnhCongTo, GhiChu = dto.GhiChu, TrangThai = "Chờ xác nhận", NgayGui = DateTime.Now };
        _context.ChiSoCongToGuiTuThues.Add(chiSoGui);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetMyMeterReadings), new { id = chiSoGui.Id }, new ChiSoCongToGuiTuThueDTO { Id = chiSoGui.Id, PhongTroId = chiSoGui.PhongTroId, LoaiCongTo = chiSoGui.LoaiCongTo, ChiSo = chiSoGui.ChiSo, ThangNam = chiSoGui.ThangNam, AnhCongTo = chiSoGui.AnhCongTo, TrangThai = chiSoGui.TrangThai, GhiChu = chiSoGui.GhiChu, NgayGui = chiSoGui.NgayGui });
    }

    [HttpGet("tenant")]
    [Authorize(Roles = "Người thuê")]
    public async Task<ActionResult<IEnumerable<ChiSoCongToGuiTuThueDTO>>> GetMyMeterReadings()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();
        var userId = int.Parse(userIdClaim.Value);

        var khachThueIds = await _context.KhachThues.Where(k => k.UserId == userId).Select(k => k.Id).ToListAsync();
        if (!khachThueIds.Any()) return Ok(new List<ChiSoCongToGuiTuThueDTO>());

        var chiSos = await _context.ChiSoCongToGuiTuThues.Where(c => khachThueIds.Contains(c.KhachThueId)).OrderByDescending(c => c.NgayGui).Select(c => new ChiSoCongToGuiTuThueDTO { Id = c.Id, PhongTroId = c.PhongTroId, LoaiCongTo = c.LoaiCongTo, ChiSo = c.ChiSo, ThangNam = c.ThangNam, AnhCongTo = c.AnhCongTo, TrangThai = c.TrangThai, GhiChu = c.GhiChu, NgayGui = c.NgayGui, NgayXacNhan = c.NgayXacNhan }).ToListAsync();
        return Ok(chiSos);
    }

    // Các hàm Owner giữ nguyên từ code gốc nhưng tôi paste lại để đảm bảo đồng bộ
    [HttpGet("owner")]
    [Authorize(Roles = "Chủ trọ,Admin")]
    public async Task<ActionResult<IEnumerable<ChiSoCongToGuiTuThueDTO>>> GetAllMeterReadings()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();
        var userId = int.Parse(userIdClaim.Value);
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return Unauthorized();

        var query = _context.ChiSoCongToGuiTuThues.Include(c => c.PhongTro).ThenInclude(p => p!.DayTro).AsQueryable();
        if (user.VaiTro == "Chủ trọ")
        {
            var dayTro = await _context.DayTros.FirstOrDefaultAsync(d => d.UserId == userId);
            if (dayTro != null) query = query.Where(c => c.PhongTro != null && c.PhongTro.DayTroId == dayTro.Id);
            else return Ok(new List<ChiSoCongToGuiTuThueDTO>());
        }
        var chiSos = await query.OrderByDescending(c => c.NgayGui).Select(c => new ChiSoCongToGuiTuThueDTO { Id = c.Id, PhongTroId = c.PhongTroId, LoaiCongTo = c.LoaiCongTo, ChiSo = c.ChiSo, ThangNam = c.ThangNam, AnhCongTo = c.AnhCongTo, TrangThai = c.TrangThai, GhiChu = c.GhiChu, NgayGui = c.NgayGui, NgayXacNhan = c.NgayXacNhan }).ToListAsync();
        return Ok(chiSos);
    }

    [HttpPost("{id}/confirm")]
    [Authorize(Roles = "Chủ trọ,Admin")]
    public async Task<IActionResult> ConfirmMeterReading(int id, [FromBody] int chiSoCu)
    {
        var chiSoGui = await _context.ChiSoCongToGuiTuThues.Include(c => c.PhongTro).ThenInclude(p => p!.DayTro).FirstOrDefaultAsync(c => c.Id == id);
        if (chiSoGui == null) return NotFound();
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();
        var userId = int.Parse(userIdClaim.Value);
        var user = await _context.Users.FindAsync(userId);
        if (user?.VaiTro == "Chủ trọ")
        {
            var dayTro = await _context.DayTros.FirstOrDefaultAsync(d => d.UserId == userId);
            if (dayTro == null || chiSoGui.PhongTro?.DayTroId != dayTro.Id) return Forbid();
        }
        var chiSoCongTo = new ChiSoCongTo { PhongTroId = chiSoGui.PhongTroId, LoaiCongTo = chiSoGui.LoaiCongTo, ChiSoCu = chiSoCu, ChiSoMoi = chiSoGui.ChiSo, SoTieuThu = chiSoGui.ChiSo - chiSoCu, ThangNam = chiSoGui.ThangNam, NgayGhi = DateTime.Now, GhiChu = chiSoGui.GhiChu };
        _context.ChiSoCongTos.Add(chiSoCongTo);
        chiSoGui.TrangThai = "Đã xác nhận";
        chiSoGui.NgayXacNhan = DateTime.Now;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã xác nhận chỉ số công tơ" });
    }

    [HttpPost("{id}/reject")]
    [Authorize(Roles = "Chủ trọ,Admin")]
    public async Task<IActionResult> RejectMeterReading(int id, [FromBody] string? lyDo)
    {
        var chiSoGui = await _context.ChiSoCongToGuiTuThues.Include(c => c.PhongTro).ThenInclude(p => p!.DayTro).FirstOrDefaultAsync(c => c.Id == id);
        if (chiSoGui == null) return NotFound();
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();
        var userId = int.Parse(userIdClaim.Value);
        var user = await _context.Users.FindAsync(userId);
        if (user?.VaiTro == "Chủ trọ")
        {
            var dayTro = await _context.DayTros.FirstOrDefaultAsync(d => d.UserId == userId);
            if (dayTro == null || chiSoGui.PhongTro?.DayTroId != dayTro.Id) return Forbid();
        }
        chiSoGui.TrangThai = "Từ chối";
        if (!string.IsNullOrEmpty(lyDo)) chiSoGui.GhiChu = lyDo;
        chiSoGui.NgayXacNhan = DateTime.Now;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã từ chối chỉ số công tơ" });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<IActionResult> Delete(int id)
    {
        var chiSo = await _context.ChiSoCongToGuiTuThues
            .Include(c => c.PhongTro).ThenInclude(p => p!.DayTro)
            .FirstOrDefaultAsync(c => c.Id == id);

        if (chiSo == null) return NotFound(new { message = "Không tìm thấy phiếu ghi" });

        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var userRole = User.FindFirst(ClaimTypes.Role)?.Value;

        if (userRole == "Chủ trọ")
        {
            if (chiSo.PhongTro?.DayTro?.UserId != userId)
            {
                return Forbid(); 
            }
        }

        _context.ChiSoCongToGuiTuThues.Remove(chiSo);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Đã xóa phiếu gửi chỉ số thành công" });
    }
}