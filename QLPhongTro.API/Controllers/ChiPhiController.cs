using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLPhongTro.API.Data;
using QLPhongTro.API.DTOs;
using QLPhongTro.API.Models;
using System.Security.Claims;

namespace QLPhongTro.API.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    [Authorize(Roles = "Chủ trọ,Admin")]
    public class ChiPhiController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public ChiPhiController(ApplicationDbContext context) { _context = context; }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<ChiPhiDTO>>> GetChiPhis()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            return await _context.ChiPhis
                .Where(c => c.UserId == userId)
                .Include(c => c.DayTro)
                .OrderByDescending(c => c.NgayChi)
                .Select(c => new ChiPhiDTO
                {
                    Id = c.Id,
                    TenChiPhi = c.TenChiPhi,
                    SoTien = c.SoTien,
                    LoaiChiPhi = c.LoaiChiPhi,
                    NgayChi = c.NgayChi,
                    GhiChu = c.GhiChu,
                    DayTroId = c.DayTroId,
                    TenDayTro = c.DayTro != null ? c.DayTro.TenDayTro : "Chi chung"
                }).ToListAsync();
        }

        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateChiPhiDTO dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var cp = new ChiPhi
            {
                TenChiPhi = dto.TenChiPhi,
                SoTien = dto.SoTien,
                LoaiChiPhi = dto.LoaiChiPhi,
                NgayChi = dto.NgayChi,
                GhiChu = dto.GhiChu,
                DayTroId = dto.DayTroId,
                UserId = userId
            };
            _context.ChiPhis.Add(cp);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Thêm khoản chi thành công" });
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var cp = await _context.ChiPhis.FirstOrDefaultAsync(c => c.Id == id && c.UserId == userId);
            if (cp == null) return NotFound();
            _context.ChiPhis.Remove(cp);
            await _context.SaveChangesAsync();
            return Ok();
        }
    }
}
