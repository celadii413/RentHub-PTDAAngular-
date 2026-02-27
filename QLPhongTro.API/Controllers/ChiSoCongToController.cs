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
public class ChiSoCongToController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public ChiSoCongToController(ApplicationDbContext context)
    {
        _context = context;
    }
    private async Task<bool> IsRoomOwner(int phongTroId)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        return await _context.PhongTros.AnyAsync(p => p.Id == phongTroId && p.DayTro.UserId == userId);
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
    public async Task<ActionResult<IEnumerable<ChiSoCongToDTO>>> GetChiSoCongTos([FromQuery] int? phongTroId, [FromQuery] string? loaiCongTo, [FromQuery] DateTime? thangNam)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var query = _context.ChiSoCongTos.Include(c => c.PhongTro).ThenInclude(p => p!.DayTro).AsQueryable();

        if (User.FindFirst(ClaimTypes.Role)?.Value == "Chủ trọ")
            query = query.Where(c => c.PhongTro.DayTro.UserId == userId);

        if (phongTroId.HasValue)
            query = query.Where(c => c.PhongTroId == phongTroId.Value);

        if (!string.IsNullOrEmpty(loaiCongTo))
            query = query.Where(c => c.LoaiCongTo == loaiCongTo);

        if (thangNam.HasValue)
        {
            var thang = thangNam.Value.Month;
            var nam = thangNam.Value.Year;
            query = query.Where(c => c.ThangNam.Month == thang && c.ThangNam.Year == nam);
        }

        var chiSoCongTos = await query
            .OrderByDescending(c => c.ThangNam)
            .ThenByDescending(c => c.NgayGhi)
            .Select(c => new ChiSoCongToDTO
            {
                Id = c.Id,
                PhongTroId = c.PhongTroId,
                SoPhong = c.PhongTro != null ? c.PhongTro.SoPhong : null,
                LoaiCongTo = c.LoaiCongTo,
                ChiSoCu = c.ChiSoCu,
                ChiSoMoi = c.ChiSoMoi,
                SoTieuThu = c.SoTieuThu,
                ThangNam = c.ThangNam,
                NgayGhi = c.NgayGhi,
                GhiChu = c.GhiChu
            })
            .ToListAsync();

        return Ok(chiSoCongTos);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ChiSoCongToDTO>> GetChiSoCongTo(int id)
    {
        var query = _context.ChiSoCongTos
            .Include(c => c.PhongTro)
            .ThenInclude(p => p!.DayTro)
            .Where(c => c.Id == id);

        // Nếu là chủ trọ, chỉ được xem chỉ số của phòng trong nhà trọ của mình
        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (userDayTroId.HasValue)
            {
                query = query.Where(c => c.PhongTro != null && c.PhongTro.DayTroId == userDayTroId.Value);
            }
            else
            {
                return Forbid();
            }
        }

        var chiSoCongTo = await query
            .Select(c => new ChiSoCongToDTO
            {
                Id = c.Id,
                PhongTroId = c.PhongTroId,
                SoPhong = c.PhongTro != null ? c.PhongTro.SoPhong : null,
                LoaiCongTo = c.LoaiCongTo,
                ChiSoCu = c.ChiSoCu,
                ChiSoMoi = c.ChiSoMoi,
                SoTieuThu = c.SoTieuThu,
                ThangNam = c.ThangNam,
                NgayGhi = c.NgayGhi,
                GhiChu = c.GhiChu
            })
            .FirstOrDefaultAsync();

        if (chiSoCongTo == null)
            return NotFound();

        return Ok(chiSoCongTo);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Chủ trọ,Nhân viên")]
    public async Task<ActionResult<ChiSoCongToDTO>> CreateChiSoCongTo(CreateChiSoCongToDTO dto)
    {
        var phongTro = await _context.PhongTros
            .Include(p => p.DayTro)
            .FirstOrDefaultAsync(p => p.Id == dto.PhongTroId);
        
        if (phongTro == null)
            return BadRequest(new { message = "Phòng trọ không tồn tại" });

        if (!await IsRoomOwner(dto.PhongTroId)) return Forbid();

        var daCoChiSo = await _context.ChiSoCongTos
        .AnyAsync(c => c.PhongTroId == dto.PhongTroId &&
                       c.LoaiCongTo == dto.LoaiCongTo &&
                       c.ThangNam.Month == dto.ThangNam.Month &&
                       c.ThangNam.Year == dto.ThangNam.Year);

        if (daCoChiSo)
        {
            return BadRequest(new { message = $"Đã có chỉ số {dto.LoaiCongTo} tháng {dto.ThangNam:MM/yyyy} cho phòng này rồi. Vui lòng sửa chỉ số cũ thay vì tạo mới." });
        }

        // Lấy chỉ số tháng trước để gợi ý
        var chiSoThangTruoc = await _context.ChiSoCongTos
            .Where(c => c.PhongTroId == dto.PhongTroId && 
                       c.LoaiCongTo == dto.LoaiCongTo)
            .OrderByDescending(c => c.ThangNam)
            .ThenByDescending(c => c.NgayGhi)
            .FirstOrDefaultAsync();

        int chiSoCu = chiSoThangTruoc?.ChiSoMoi ?? dto.ChiSoCu;
        int chiSoMoi = dto.ChiSoMoi;
        int soTieuThu = chiSoMoi - chiSoCu;

        if (soTieuThu < 0)
            return BadRequest(new { message = "Chỉ số mới phải lớn hơn chỉ số cũ" });

        var chiSoCongTo = new ChiSoCongTo
        {
            PhongTroId = dto.PhongTroId,
            LoaiCongTo = dto.LoaiCongTo,
            ChiSoCu = chiSoCu,
            ChiSoMoi = chiSoMoi,
            SoTieuThu = soTieuThu,
            ThangNam = dto.ThangNam,
            NgayGhi = DateTime.Now,
            GhiChu = dto.GhiChu
        };

        _context.ChiSoCongTos.Add(chiSoCongTo);
        await _context.SaveChangesAsync();

        var result = new ChiSoCongToDTO
        {
            Id = chiSoCongTo.Id,
            PhongTroId = chiSoCongTo.PhongTroId,
            SoPhong = phongTro.SoPhong,
            LoaiCongTo = chiSoCongTo.LoaiCongTo,
            ChiSoCu = chiSoCongTo.ChiSoCu,
            ChiSoMoi = chiSoCongTo.ChiSoMoi,
            SoTieuThu = chiSoCongTo.SoTieuThu,
            ThangNam = chiSoCongTo.ThangNam,
            NgayGhi = chiSoCongTo.NgayGhi,
            GhiChu = chiSoCongTo.GhiChu
        };

        return CreatedAtAction(nameof(GetChiSoCongTo), new { id = chiSoCongTo.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<IActionResult> UpdateChiSoCongTo(int id, UpdateChiSoCongToDTO dto)
    {
        var chiSoCongTo = await _context.ChiSoCongTos
            .Include(c => c.PhongTro)
            .ThenInclude(p => p!.DayTro)
            .FirstOrDefaultAsync(c => c.Id == id);
        
        if (chiSoCongTo == null)
            return NotFound();

        // Nếu là chủ trọ, chỉ được sửa chỉ số của phòng trong nhà trọ của mình
        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (!userDayTroId.HasValue || chiSoCongTo.PhongTro == null || chiSoCongTo.PhongTro.DayTroId != userDayTroId.Value)
            {
                return Forbid();
            }
        }

        if (dto.ChiSoMoi < dto.ChiSoCu)
        {
            return BadRequest(new { message = "Chỉ số mới không được nhỏ hơn chỉ số cũ." });
        }

        int soTieuThu = dto.ChiSoMoi - dto.ChiSoCu;
        if (soTieuThu < 0)
            return BadRequest(new { message = "Chỉ số mới phải lớn hơn 0" });

        chiSoCongTo.ChiSoCu = dto.ChiSoCu;
        chiSoCongTo.ChiSoMoi = dto.ChiSoMoi;
        chiSoCongTo.SoTieuThu = soTieuThu;
        chiSoCongTo.ThangNam = dto.ThangNam;
        chiSoCongTo.GhiChu = dto.GhiChu;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<IActionResult> DeleteChiSoCongTo(int id)
    {
        var chiSoCongTo = await _context.ChiSoCongTos
            .Include(c => c.PhongTro)
            .ThenInclude(p => p!.DayTro)
            .FirstOrDefaultAsync(c => c.Id == id);
        
        if (chiSoCongTo == null)
            return NotFound();

        // Nếu là chủ trọ, chỉ được xóa chỉ số của phòng trong nhà trọ của mình
        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (!userDayTroId.HasValue || chiSoCongTo.PhongTro == null || chiSoCongTo.PhongTro.DayTroId != userDayTroId.Value)
            {
                return Forbid();
            }
        }

        _context.ChiSoCongTos.Remove(chiSoCongTo);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("goi-y/{phongTroId}/{loaiCongTo}")]
    public async Task<ActionResult<GoiYChiSoDTO>> GetGoiYChiSo(int phongTroId, string loaiCongTo)
    {
        if (!await IsRoomOwner(phongTroId)) return Forbid();

        var chiSoThangTruoc = await _context.ChiSoCongTos
            .Where(c => c.PhongTroId == phongTroId && c.LoaiCongTo == loaiCongTo)
            .OrderByDescending(c => c.ThangNam)
            .ThenByDescending(c => c.NgayGhi)
            .FirstOrDefaultAsync();

        if (chiSoThangTruoc == null)
            return Ok(new GoiYChiSoDTO { ChiSoCu = 0, ChiSoMoiGoiY = 0 });

        return Ok(new GoiYChiSoDTO
        {
            ChiSoCu = chiSoThangTruoc.ChiSoMoi,
            ChiSoMoiGoiY = chiSoThangTruoc.ChiSoMoi,
            ThangNamCu = chiSoThangTruoc.ThangNam
        });
    }

    [HttpGet("lich-su/{phongTroId}/{loaiCongTo}")]
    public async Task<ActionResult<IEnumerable<ChiSoCongToDTO>>> GetLichSuChiSo(int phongTroId, string loaiCongTo, [FromQuery] int soThang = 12)
    {
        // Nếu là chủ trọ, kiểm tra phòng có thuộc nhà trọ của mình không
        if (IsOwner())
        {
            var phongTro = await _context.PhongTros
                .Include(p => p.DayTro)
                .FirstOrDefaultAsync(p => p.Id == phongTroId);
            
            if (phongTro != null)
            {
                var userDayTroId = await GetUserDayTroIdAsync();
                if (!userDayTroId.HasValue || phongTro.DayTroId != userDayTroId.Value)
                {
                    return Forbid();
                }
            }
        }

        var thangBatDau = DateTime.Now.AddMonths(-soThang);

        var lichSu = await _context.ChiSoCongTos
            .Include(c => c.PhongTro)
            .Where(c => c.PhongTroId == phongTroId && 
                       c.LoaiCongTo == loaiCongTo &&
                       c.ThangNam >= thangBatDau)
            .OrderBy(c => c.ThangNam)
            .Select(c => new ChiSoCongToDTO
            {
                Id = c.Id,
                PhongTroId = c.PhongTroId,
                SoPhong = c.PhongTro != null ? c.PhongTro.SoPhong : null,
                LoaiCongTo = c.LoaiCongTo,
                ChiSoCu = c.ChiSoCu,
                ChiSoMoi = c.ChiSoMoi,
                SoTieuThu = c.SoTieuThu,
                ThangNam = c.ThangNam,
                NgayGhi = c.NgayGhi,
                GhiChu = c.GhiChu
            })
            .ToListAsync();

        return Ok(lichSu);
    }
}

