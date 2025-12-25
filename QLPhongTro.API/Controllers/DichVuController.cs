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
public class DichVuController : ControllerBase
{
    private readonly ApplicationDbContext _context;

    public DichVuController(ApplicationDbContext context)
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
    public async Task<ActionResult<IEnumerable<DichVuDTO>>> GetDichVus([FromQuery] int? dayTroId, [FromQuery] int? phongTroId)
    {
        var query = _context.DichVus
            .Include(d => d.DayTro)
            .Include(d => d.PhongTro)
            .AsQueryable();

        // Nếu là chủ trọ, tự động filter theo DayTro của mình
        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (userDayTroId.HasValue)
            {
                query = query.Where(d => d.DayTroId == userDayTroId.Value || 
                                        (d.PhongTro != null && d.PhongTro.DayTroId == userDayTroId.Value));
            }
            else
            {
                // Chủ trọ chưa có nhà trọ
                return Ok(new List<DichVuDTO>());
            }
        }
        else if (dayTroId.HasValue)
        {
            // Admin có thể filter theo dayTroId
            query = query.Where(d => d.DayTroId == dayTroId.Value);
        }

        if (phongTroId.HasValue)
            query = query.Where(d => d.PhongTroId == phongTroId.Value);

        var dichVus = await query
            .Select(d => new DichVuDTO
            {
                Id = d.Id,
                TenDichVu = d.TenDichVu,
                DonViTinh = d.DonViTinh,
                GiaMacDinh = d.GiaMacDinh,
                LoaiGia = d.LoaiGia,
                DayTroId = d.DayTroId,
                TenDayTro = d.DayTro != null ? d.DayTro.TenDayTro : null,
                PhongTroId = d.PhongTroId,
                SoPhong = d.PhongTro != null ? d.PhongTro.SoPhong : null,
                IsActive = d.IsActive,
                NgayTao = d.NgayTao
            })
            .ToListAsync();

        return Ok(dichVus);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<DichVuDTO>> GetDichVu(int id)
    {
        var query = _context.DichVus
            .Include(d => d.DayTro)
            .Include(d => d.PhongTro)
            .Where(d => d.Id == id);

        // Nếu là chủ trọ, chỉ được xem dịch vụ của nhà trọ của mình
        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (userDayTroId.HasValue)
            {
                query = query.Where(d => d.DayTroId == userDayTroId.Value || 
                                        (d.PhongTro != null && d.PhongTro.DayTroId == userDayTroId.Value));
            }
            else
            {
                return Forbid();
            }
        }

        var dichVu = await query
            .Select(d => new DichVuDTO
            {
                Id = d.Id,
                TenDichVu = d.TenDichVu,
                DonViTinh = d.DonViTinh,
                GiaMacDinh = d.GiaMacDinh,
                LoaiGia = d.LoaiGia,
                DayTroId = d.DayTroId,
                TenDayTro = d.DayTro != null ? d.DayTro.TenDayTro : null,
                PhongTroId = d.PhongTroId,
                SoPhong = d.PhongTro != null ? d.PhongTro.SoPhong : null,
                IsActive = d.IsActive,
                NgayTao = d.NgayTao
            })
            .FirstOrDefaultAsync();

        if (dichVu == null)
            return NotFound();

        return Ok(dichVu);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<ActionResult<DichVuDTO>> CreateDichVu(CreateDichVuDTO dto)
    {
        // Nếu là chủ trọ, tự động gán DayTroId của mình
        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (!userDayTroId.HasValue)
            {
                return BadRequest(new { message = "Bạn chưa có nhà trọ. Vui lòng tạo nhà trọ trước." });
            }
            
            // Nếu có DayTroId, đảm bảo nó thuộc về user
            if (dto.DayTroId.HasValue && dto.DayTroId.Value != userDayTroId.Value)
            {
                return Forbid();
            }
            
            // Nếu không có DayTroId, tự động gán
            if (!dto.DayTroId.HasValue)
            {
                dto.DayTroId = userDayTroId.Value;
            }
        }

        if (dto.DayTroId.HasValue && !await _context.DayTros.AnyAsync(d => d.Id == dto.DayTroId.Value))
            return BadRequest(new { message = "Dãy trọ không tồn tại" });

        if (dto.PhongTroId.HasValue)
        {
            var phongTro = await _context.PhongTros
                .Include(p => p.DayTro)
                .FirstOrDefaultAsync(p => p.Id == dto.PhongTroId.Value);
            
            if (phongTro == null)
                return BadRequest(new { message = "Phòng trọ không tồn tại" });

            // Nếu là chủ trọ, kiểm tra phòng có thuộc nhà trọ của mình không
            if (IsOwner())
            {
                var userDayTroId = await GetUserDayTroIdAsync();
                if (userDayTroId.HasValue && phongTro.DayTroId != userDayTroId.Value)
                {
                    return Forbid();
                }
            }
        }

        var dichVu = new DichVu
        {
            TenDichVu = dto.TenDichVu,
            DonViTinh = dto.DonViTinh,
            GiaMacDinh = dto.GiaMacDinh,
            LoaiGia = dto.LoaiGia,
            DayTroId = dto.DayTroId,
            PhongTroId = dto.PhongTroId,
            IsActive = true,
            NgayTao = DateTime.Now
        };

        _context.DichVus.Add(dichVu);
        await _context.SaveChangesAsync();

        var dayTro = dto.DayTroId.HasValue ? await _context.DayTros.FindAsync(dto.DayTroId.Value) : null;
        var phongTroInfo = dto.PhongTroId.HasValue ? await _context.PhongTros.FindAsync(dto.PhongTroId.Value) : null;

        var result = new DichVuDTO
        {
            Id = dichVu.Id,
            TenDichVu = dichVu.TenDichVu,
            DonViTinh = dichVu.DonViTinh,
            GiaMacDinh = dichVu.GiaMacDinh,
            LoaiGia = dichVu.LoaiGia,
            DayTroId = dichVu.DayTroId,
            TenDayTro = dayTro?.TenDayTro,
            PhongTroId = dichVu.PhongTroId,
            SoPhong = phongTroInfo?.SoPhong,
            IsActive = dichVu.IsActive,
            NgayTao = dichVu.NgayTao
        };

        return CreatedAtAction(nameof(GetDichVu), new { id = dichVu.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<IActionResult> UpdateDichVu(int id, UpdateDichVuDTO dto)
    {
        var dichVu = await _context.DichVus
            .Include(d => d.DayTro)
            .Include(d => d.PhongTro)
            .FirstOrDefaultAsync(d => d.Id == id);
        
        if (dichVu == null)
            return NotFound();

        // Nếu là chủ trọ, chỉ được sửa dịch vụ của nhà trọ của mình
        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (!userDayTroId.HasValue)
            {
                return Forbid();
            }

            bool isOwnerDichVu = (dichVu.DayTroId.HasValue && dichVu.DayTroId.Value == userDayTroId.Value) ||
                                 (dichVu.PhongTro != null && dichVu.PhongTro.DayTroId == userDayTroId.Value);
            
            if (!isOwnerDichVu)
            {
                return Forbid();
            }
        }

        dichVu.TenDichVu = dto.TenDichVu;
        dichVu.DonViTinh = dto.DonViTinh;
        dichVu.GiaMacDinh = dto.GiaMacDinh;
        dichVu.LoaiGia = dto.LoaiGia;
        dichVu.IsActive = dto.IsActive;
        dichVu.NgayCapNhat = DateTime.Now;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<IActionResult> DeleteDichVu(int id)
    {
        var dichVu = await _context.DichVus
            .Include(d => d.DayTro)
            .Include(d => d.PhongTro)
            .FirstOrDefaultAsync(d => d.Id == id);
        
        if (dichVu == null)
            return NotFound();

        // Nếu là chủ trọ, chỉ được xóa dịch vụ của nhà trọ của mình
        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (!userDayTroId.HasValue)
            {
                return Forbid();
            }

            bool isOwnerDichVu = (dichVu.DayTroId.HasValue && dichVu.DayTroId.Value == userDayTroId.Value) ||
                                 (dichVu.PhongTro != null && dichVu.PhongTro.DayTroId == userDayTroId.Value);
            
            if (!isOwnerDichVu)
            {
                return Forbid();
            }
        }

        _context.DichVus.Remove(dichVu);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("gia-theo-phong/{phongTroId}")]
    public async Task<ActionResult<Dictionary<string, decimal>>> GetGiaDichVuTheoPhong(int phongTroId)
    {
        var phongTro = await _context.PhongTros
            .Include(p => p.DayTro)
            .FirstOrDefaultAsync(p => p.Id == phongTroId);

        if (phongTro == null)
            return NotFound();

        // Nếu là chủ trọ, chỉ được xem giá dịch vụ của phòng trong nhà trọ của mình
        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (!userDayTroId.HasValue || phongTro.DayTroId != userDayTroId.Value)
            {
                return Forbid();
            }
        }

        // Lấy giá dịch vụ theo thứ tự ưu tiên: Phòng > Dãy > Chung
        var dichVus = await _context.DichVus
            .Where(d => d.IsActive && (
                d.PhongTroId == phongTroId ||
                (d.DayTroId == phongTro.DayTroId && d.LoaiGia == "Theo dãy") ||
                (d.LoaiGia == "Chung" && d.PhongTroId == null && d.DayTroId == null)
            ))
            .ToListAsync();

        var giaDichVu = new Dictionary<string, decimal>();
        foreach (var dv in dichVus)
        {
            if (!giaDichVu.ContainsKey(dv.TenDichVu))
            {
                giaDichVu[dv.TenDichVu] = dv.GiaMacDinh;
            }
        }

        return Ok(giaDichVu);
    }
}

