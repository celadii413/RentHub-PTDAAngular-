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
public class YeuCauChinhSuaController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    public YeuCauChinhSuaController(ApplicationDbContext context) { _context = context; }

    [HttpPost]
    [Authorize(Roles = "Người thuê")]
    public async Task<ActionResult<YeuCauChinhSuaDTO>> CreateYeuCau([FromBody] CreateYeuCauChinhSuaDTO dto)
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();
        var userId = int.Parse(userIdClaim.Value);

        var khachThue = await _context.KhachThues.FirstOrDefaultAsync(k => k.UserId == userId && k.NgayKetThucThue == null);
        if (khachThue == null) return BadRequest(new { message = "Bạn không thuê phòng nào hoặc đã trả phòng" });
        if (khachThue.PhongTroId != dto.PhongTroId) return Forbid();

        var yeuCau = new YeuCauChinhSua { KhachThueId = khachThue.Id, PhongTroId = dto.PhongTroId, LoaiYeuCau = dto.LoaiYeuCau, TieuDe = dto.TieuDe, NoiDung = dto.NoiDung, AnhMinhHoa = dto.AnhMinhHoa, TrangThai = "Chờ xử lý", NgayTao = DateTime.Now };
        _context.YeuCauChinhSuas.Add(yeuCau);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(GetYeuCau), new { id = yeuCau.Id }, new YeuCauChinhSuaDTO { Id = yeuCau.Id, KhachThueId = yeuCau.KhachThueId, PhongTroId = yeuCau.PhongTroId, LoaiYeuCau = yeuCau.LoaiYeuCau, TieuDe = yeuCau.TieuDe, NoiDung = yeuCau.NoiDung, AnhMinhHoa = yeuCau.AnhMinhHoa, TrangThai = yeuCau.TrangThai, NgayTao = yeuCau.NgayTao });
    }

    [HttpGet("tenant")]
    [Authorize(Roles = "Người thuê")]
    public async Task<ActionResult<IEnumerable<YeuCauChinhSuaDTO>>> GetMyYeuCaus()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();
        var userId = int.Parse(userIdClaim.Value);

        var khachThueIds = await _context.KhachThues.Where(k => k.UserId == userId).Select(k => k.Id).ToListAsync();
        if (!khachThueIds.Any()) return Ok(new List<YeuCauChinhSuaDTO>());

        var yeuCaus = await _context.YeuCauChinhSuas.Where(y => khachThueIds.Contains(y.KhachThueId)).OrderByDescending(y => y.NgayTao).Select(y => new YeuCauChinhSuaDTO { Id = y.Id, KhachThueId = y.KhachThueId, PhongTroId = y.PhongTroId, LoaiYeuCau = y.LoaiYeuCau, TieuDe = y.TieuDe, NoiDung = y.NoiDung, AnhMinhHoa = y.AnhMinhHoa, TrangThai = y.TrangThai, PhanHoi = y.PhanHoi, NgayTao = y.NgayTao, NgayXuLy = y.NgayXuLy }).ToListAsync();
        return Ok(yeuCaus);
    }

    // Các hàm Owner giữ nguyên
    [HttpGet("owner")]
    [Authorize(Roles = "Chủ trọ,Admin")]
    public async Task<ActionResult<IEnumerable<YeuCauChinhSuaDTO>>> GetAllYeuCaus()
    {
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();
        var userId = int.Parse(userIdClaim.Value);
        var user = await _context.Users.FindAsync(userId);
        if (user == null) return Unauthorized();

        var query = _context.YeuCauChinhSuas.Include(y => y.PhongTro).ThenInclude(p => p!.DayTro).AsQueryable();
        if (user.VaiTro == "Chủ trọ")
        {
            var dayTro = await _context.DayTros.FirstOrDefaultAsync(d => d.UserId == userId);
            if (dayTro != null) query = query.Where(y => y.PhongTro != null && y.PhongTro.DayTroId == dayTro.Id);
            else return Ok(new List<YeuCauChinhSuaDTO>());
        }
        var yeuCaus = await query.OrderByDescending(y => y.NgayTao).Select(y => new YeuCauChinhSuaDTO { Id = y.Id, KhachThueId = y.KhachThueId, PhongTroId = y.PhongTroId, LoaiYeuCau = y.LoaiYeuCau, TieuDe = y.TieuDe, NoiDung = y.NoiDung, AnhMinhHoa = y.AnhMinhHoa, TrangThai = y.TrangThai, PhanHoi = y.PhanHoi, NgayTao = y.NgayTao, NgayXuLy = y.NgayXuLy }).ToListAsync();
        return Ok(yeuCaus);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<YeuCauChinhSuaDTO>> GetYeuCau(int id)
    {
        var yeuCau = await _context.YeuCauChinhSuas.FirstOrDefaultAsync(y => y.Id == id);
        if (yeuCau == null) return NotFound();
        return Ok(new YeuCauChinhSuaDTO { Id = yeuCau.Id, KhachThueId = yeuCau.KhachThueId, PhongTroId = yeuCau.PhongTroId, LoaiYeuCau = yeuCau.LoaiYeuCau, TieuDe = yeuCau.TieuDe, NoiDung = yeuCau.NoiDung, AnhMinhHoa = yeuCau.AnhMinhHoa, TrangThai = yeuCau.TrangThai, PhanHoi = yeuCau.PhanHoi, NgayTao = yeuCau.NgayTao, NgayXuLy = yeuCau.NgayXuLy });
    }

    [HttpPut("{id}/response")]
    [Authorize(Roles = "Chủ trọ,Admin")]
    public async Task<IActionResult> RespondToYeuCau(int id, [FromBody] PhanHoiYeuCauDTO dto)
    {
        var yeuCau = await _context.YeuCauChinhSuas.Include(y => y.PhongTro).ThenInclude(p => p!.DayTro).FirstOrDefaultAsync(y => y.Id == id);
        if (yeuCau == null) return NotFound();
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim == null) return Unauthorized();
        var userId = int.Parse(userIdClaim.Value);
        var user = await _context.Users.FindAsync(userId);
        if (user?.VaiTro == "Chủ trọ")
        {
            var dayTro = await _context.DayTros.FirstOrDefaultAsync(d => d.UserId == userId);
            if (dayTro == null || yeuCau.PhongTro?.DayTroId != dayTro.Id) return Forbid();
        }
        yeuCau.PhanHoi = dto.PhanHoi; yeuCau.TrangThai = dto.TrangThai; yeuCau.NgayXuLy = DateTime.Now;
        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã cập nhật phản hồi" });
    }
}