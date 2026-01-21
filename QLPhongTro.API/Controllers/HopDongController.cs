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
public class HopDongController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly IPdfService _pdfService;

    public HopDongController(
        ApplicationDbContext context, IEmailService emailService, IPdfService pdfService)     
    {
        _context = context;
        _emailService = emailService; 
        _pdfService = pdfService;
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
    public async Task<ActionResult<IEnumerable<HopDongDTO>>> GetHopDongs([FromQuery] int? phongTroId, [FromQuery] int? khachThueId, [FromQuery] string? trangThai)
    {
        var query = _context.HopDongs
            .Include(h => h.PhongTro)
            .Include(h => h.KhachThue)
            .AsQueryable();

        // Nếu là chủ trọ, chỉ trả về hợp đồng của phòng trong nhà trọ của mình
        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (userDayTroId.HasValue)
            {
                query = query.Where(h => h.PhongTro != null && h.PhongTro.DayTroId == userDayTroId.Value);
            }
            else
            {
                return Ok(new List<HopDongDTO>());
            }
        }
        else if (phongTroId.HasValue)
        {
            // Admin có thể filter theo phongTroId
            query = query.Where(h => h.PhongTroId == phongTroId.Value);
        }

        if (khachThueId.HasValue)
            query = query.Where(h => h.KhachThueId == khachThueId.Value);

        if (!string.IsNullOrEmpty(trangThai))
            query = query.Where(h => h.TrangThai == trangThai);

        var hopDongs = await query
            .Select(h => new HopDongDTO
            {
                Id = h.Id,
                MaHopDong = h.MaHopDong,
                PhongTroId = h.PhongTroId,
                SoPhong = h.PhongTro != null ? h.PhongTro.SoPhong : null,
                KhachThueId = h.KhachThueId,
                TenKhachThue = h.KhachThue != null ? h.KhachThue.HoTen : null,
                NgayBatDau = h.NgayBatDau,
                NgayKetThuc = h.NgayKetThuc,
                GiaThue = h.GiaThue,
                TienCoc = h.TienCoc,
                TrangThai = h.TrangThai,
                GhiChu = h.GhiChu,
                FileHopDong = h.FileHopDong,
                NgayTao = h.NgayTao
            })
            .OrderByDescending(h => h.NgayTao)
            .ToListAsync();

        return Ok(hopDongs);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<HopDongDTO>> GetHopDong(int id)
    {
        var query = _context.HopDongs
            .Include(h => h.PhongTro)
            .Include(h => h.KhachThue)
            .Where(h => h.Id == id);

        // Nếu là chủ trọ, chỉ được xem hợp đồng của phòng trong nhà trọ của mình
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

        var hopDong = await query
            .Select(h => new HopDongDTO
            {
                Id = h.Id,
                MaHopDong = h.MaHopDong,
                PhongTroId = h.PhongTroId,
                SoPhong = h.PhongTro != null ? h.PhongTro.SoPhong : null,
                KhachThueId = h.KhachThueId,
                TenKhachThue = h.KhachThue != null ? h.KhachThue.HoTen : null,
                NgayBatDau = h.NgayBatDau,
                NgayKetThuc = h.NgayKetThuc,
                GiaThue = h.GiaThue,
                TienCoc = h.TienCoc,
                TrangThai = h.TrangThai,
                GhiChu = h.GhiChu,
                FileHopDong = h.FileHopDong,
                NgayTao = h.NgayTao
            })
            .FirstOrDefaultAsync();

        if (hopDong == null)
            return NotFound();

        return Ok(hopDong);
    }

    [HttpPost]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<ActionResult<HopDongDTO>> CreateHopDong(CreateHopDongDTO dto)
    {
        var phongTro = await _context.PhongTros
            .Include(p => p.DayTro)
            .FirstOrDefaultAsync(p => p.Id == dto.PhongTroId);
        
        if (phongTro == null)
            return BadRequest(new { message = "Phòng trọ không tồn tại" });

        // Nếu là chủ trọ, chỉ được tạo hợp đồng cho phòng trong nhà trọ của mình
        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (!userDayTroId.HasValue || phongTro.DayTroId != userDayTroId.Value)
            {
                return Forbid();
            }
        }

        var khachThue = await _context.KhachThues.FindAsync(dto.KhachThueId);
        if (khachThue == null)
            return BadRequest(new { message = "Khách thuê không tồn tại" });

        // Kiểm tra phòng đã có hợp đồng đang hiệu lực chưa
        var hopDongHieuLuc = await _context.HopDongs
            .AnyAsync(h => h.PhongTroId == dto.PhongTroId && 
                          h.TrangThai == "Đang hiệu lực" &&
                          h.NgayKetThuc >= DateTime.Now);
        
        if (hopDongHieuLuc)
            return BadRequest(new { message = "Phòng đã có hợp đồng đang hiệu lực" });

        var maHopDong = $"HD{DateTime.Now:yyyyMMddHHmmss}{dto.PhongTroId}";

        string trangThai = "Đang hiệu lực";

        // Nếu ngày kết thúc nhỏ hơn ngày hiện tại -> Đã kết thúc
        if (dto.NgayKetThuc.Date < DateTime.Now.Date)
        {
            trangThai = "Đã kết thúc";
        }

        var hopDong = new HopDong
        {
            MaHopDong = maHopDong,
            PhongTroId = dto.PhongTroId,
            KhachThueId = dto.KhachThueId,
            NgayBatDau = dto.NgayBatDau,
            NgayKetThuc = dto.NgayKetThuc,
            GiaThue = dto.GiaThue,
            TienCoc = dto.TienCoc,
            TrangThai = "Đang hiệu lực",
            GhiChu = dto.GhiChu,
            NgayTao = DateTime.Now
        };

        if (trangThai == "Đang hiệu lực")
        {
            phongTro.TrangThai = "Đã thuê";
        }

        _context.HopDongs.Add(hopDong);
        await _context.SaveChangesAsync();

        var result = new HopDongDTO
        {
            Id = hopDong.Id,
            MaHopDong = hopDong.MaHopDong,
            PhongTroId = hopDong.PhongTroId,
            SoPhong = phongTro.SoPhong,
            KhachThueId = hopDong.KhachThueId,
            TenKhachThue = khachThue.HoTen,
            NgayBatDau = hopDong.NgayBatDau,
            NgayKetThuc = hopDong.NgayKetThuc,
            GiaThue = hopDong.GiaThue,
            TienCoc = hopDong.TienCoc,
            TrangThai = hopDong.TrangThai,
            GhiChu = hopDong.GhiChu,
            NgayTao = hopDong.NgayTao
        };

        return CreatedAtAction(nameof(GetHopDong), new { id = hopDong.Id }, result);
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<IActionResult> UpdateHopDong(int id, UpdateHopDongDTO dto)
    {
        var hopDong = await _context.HopDongs
            .Include(h => h.PhongTro)
            .FirstOrDefaultAsync(h => h.Id == id);
        
        if (hopDong == null)
            return NotFound();

        // Nếu là chủ trọ, chỉ được sửa hợp đồng của phòng trong nhà trọ của mình
        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (!userDayTroId.HasValue || hopDong.PhongTro == null || hopDong.PhongTro.DayTroId != userDayTroId.Value)
            {
                return Forbid();
            }
        }

        hopDong.NgayBatDau = dto.NgayBatDau;
        hopDong.NgayKetThuc = dto.NgayKetThuc;
        hopDong.GiaThue = dto.GiaThue;
        hopDong.TienCoc = dto.TienCoc;
        hopDong.TrangThai = dto.TrangThai;
        hopDong.GhiChu = dto.GhiChu;

        if (dto.NgayKetThuc.Date < DateTime.Now.Date)
        {
            // Quá hạn -> Hết hiệu lực
            hopDong.TrangThai = "Đã kết thúc";

            if (hopDong.PhongTro != null)
            {
                hopDong.PhongTro.TrangThai = "Trống";
            }
        }
        else
        {
            // Chưa quá hạn -> Kiểm tra xem user có muốn tái kích hoạt không?
            // Nếu trạng thái cũ đang là "Đã kết thúc" mà giờ gia hạn ngày -> Tự động bật lại "Đang hiệu lực"
            if (hopDong.TrangThai == "Đã kết thúc")
            {
                hopDong.TrangThai = "Đang hiệu lực";

                // Cập nhật lại phòng thành Đã thuê
                if (hopDong.PhongTro != null)
                {
                    hopDong.PhongTro.TrangThai = "Đã thuê";
                }
            }
            else
            {
                // Nếu không phải trường hợp gia hạn, thì lấy theo ý người dùng gửi lên (hoặc giữ nguyên)
                hopDong.TrangThai = dto.TrangThai;
            }
        }

        hopDong.NgayCapNhat = DateTime.Now;

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/ket-thuc")]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<IActionResult> KetThucHopDong(int id)
    {
        var hopDong = await _context.HopDongs
            .Include(h => h.PhongTro)
            .ThenInclude(p => p!.DayTro)
            .FirstOrDefaultAsync(h => h.Id == id);
        
        if (hopDong == null)
            return NotFound();

        // Nếu là chủ trọ, chỉ được kết thúc hợp đồng của phòng trong nhà trọ của mình
        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (!userDayTroId.HasValue || hopDong.PhongTro == null || hopDong.PhongTro.DayTroId != userDayTroId.Value)
            {
                return Forbid();
            }
        }

        hopDong.TrangThai = "Đã kết thúc";
        hopDong.NgayCapNhat = DateTime.Now;

        // Cập nhật trạng thái phòng
        if (hopDong.PhongTro != null)
        {
            var soHopDongHieuLuc = await _context.HopDongs
                .CountAsync(h => h.PhongTroId == hopDong.PhongTroId && 
                               h.TrangThai == "Đang hiệu lực" &&
                               h.Id != id);
            
            if (soHopDongHieuLuc == 0)
            {
                hopDong.PhongTro.TrangThai = "Trống";
            }
        }

        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã kết thúc hợp đồng" });
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<IActionResult> DeleteHopDong(int id)
    {
        var hopDong = await _context.HopDongs
            .Include(h => h.PhongTro) 
            .ThenInclude(p => p.DayTro)
            .FirstOrDefaultAsync(h => h.Id == id);

        if (hopDong == null) return NotFound();

        // Check quyền chủ trọ
        var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
        if (userIdClaim != null)
        {
            var userId = int.Parse(userIdClaim.Value);
            var user = await _context.Users.FindAsync(userId);
            if (user?.VaiTro == "Chủ trọ")
            {
                if (hopDong.PhongTro?.DayTro?.UserId != userId) return Forbid();
            }
        }

        // Nếu xóa hợp đồng đang hiệu lực -> Phải trả phòng về trạng thái "Trống"
        if (hopDong.TrangThai == "Đang hiệu lực" && hopDong.PhongTro != null)
        {
            // Kiểm tra xem phòng này CÒN hợp đồng nào khác đang chạy không?
            var hopDongKhac = await _context.HopDongs
                .AnyAsync(h => h.PhongTroId == hopDong.PhongTroId &&
                               h.Id != id &&
                               h.TrangThai == "Đang hiệu lực");

            if (!hopDongKhac)
            {
                hopDong.PhongTro.TrangThai = "Trống";
            }
        }

        _context.HopDongs.Remove(hopDong);
        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPost("{id}/gia-han")]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<IActionResult> GiaHanHopDong(int id, GiaHanHopDongDTO dto)
    {
        var hopDong = await _context.HopDongs
            .Include(h => h.PhongTro)
            .FirstOrDefaultAsync(h => h.Id == id);
        
        if (hopDong == null)
            return NotFound();

        // Nếu là chủ trọ, chỉ được gia hạn hợp đồng của phòng trong nhà trọ của mình
        if (IsOwner())
        {
            var userDayTroId = await GetUserDayTroIdAsync();
            if (!userDayTroId.HasValue || hopDong.PhongTro == null || hopDong.PhongTro.DayTroId != userDayTroId.Value)
            {
                return Forbid();
            }
        }

        hopDong.NgayKetThuc = dto.NgayKetThucMoi;
        hopDong.NgayCapNhat = DateTime.Now;

        await _context.SaveChangesAsync();
        return Ok(new { message = "Đã gia hạn hợp đồng" });
    }

    [HttpPost("{id}/send-email")]
    [Authorize(Roles = "Admin,Chủ trọ")]
    public async Task<IActionResult> SendEmailHopDong(int id)
    {
        var hopDong = await _context.HopDongs
            .Include(h => h.KhachThue)
            .Include(h => h.PhongTro)
            .ThenInclude(p => p.DayTro)
            .FirstOrDefaultAsync(h => h.Id == id);

        if (hopDong == null) return NotFound(new { message = "Hợp đồng không tồn tại" });

        var khachEmail = hopDong.KhachThue?.Email;
        if (string.IsNullOrEmpty(khachEmail))
            return BadRequest(new { message = "Khách thuê chưa có email." });

        try
        {
            // Tạo file PDF Hợp đồng
            var pdfBytes = await _pdfService.GenerateContractPdfAsync(id);

            // Gửi Email
            var subject = $"Hợp đồng thuê phòng - {hopDong.PhongTro?.TenPhong}";
            var body = $@"
                <h3>Xin chào {hopDong.KhachThue?.HoTen},</h3>
                <p>Chúng tôi gửi bạn bản hợp đồng thuê phòng trọ số <b>{hopDong.PhongTro?.SoPhong}</b>.</p>
                <p>Thời hạn: {hopDong.NgayBatDau:dd/MM/yyyy} - {hopDong.NgayKetThuc:dd/MM/yyyy}</p>
                <p>Vui lòng xem file đính kèm.</p>";

            await _emailService.SendEmailWithAttachmentAsync(
                khachEmail,
                subject,
                body,
                pdfBytes,
                $"HopDong_{hopDong.MaHopDong}.pdf"
            );

            return Ok(new { message = $"Đã gửi hợp đồng tới {khachEmail}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Lỗi gửi email: " + ex.Message });
        }
    }
}

