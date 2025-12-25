using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLPhongTro.API.Data;
using QLPhongTro.API.DTOs;
using QLPhongTro.API.Services;

namespace QLPhongTro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class OtpController : ControllerBase
{
    private readonly IOtpService _otpService;
    private readonly ApplicationDbContext _context;

    public OtpController(IOtpService otpService, ApplicationDbContext context)
    {
        _otpService = otpService;
        _context = context;
    }

    [HttpPost("send")]
    public async Task<IActionResult> SendOtp([FromBody] SendOtpDTO dto)
    {
        if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Purpose))
        {
            return BadRequest(new { message = "Email và mục đích là bắt buộc" });
        }

        var userExists = await _context.Users.AnyAsync(u => u.Email == dto.Email);

        if (dto.Purpose == "Register")
        {
            if (userExists)
            {
                return BadRequest(new { message = "Email này đã được sử dụng. Vui lòng đăng nhập hoặc dùng email khác." });
            }
        }
        else if (dto.Purpose == "Login")
        {
            if (!userExists)
            {
                return BadRequest(new { message = "Email này chưa được đăng ký trong hệ thống." });
            }
        }

        try
        {
            await _otpService.GenerateOtpAsync(dto.Email, dto.Purpose);
            return Ok(new { message = "Đã gửi mã OTP đến email của bạn. Vui lòng kiểm tra hộp thư." });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Không thể gửi OTP: {ex.Message}" });
        }
    }

    [HttpPost("verify")]
    public async Task<IActionResult> VerifyOtp([FromBody] VerifyOtpDTO dto)
    {
        if (string.IsNullOrEmpty(dto.Email) || string.IsNullOrEmpty(dto.Code) || string.IsNullOrEmpty(dto.Purpose))
        {
            return BadRequest(new { message = "Email, mã OTP và mục đích là bắt buộc" });
        }

        var isValid = await _otpService.VerifyOtpAsync(dto.Email, dto.Code, dto.Purpose);
        if (!isValid)
        {
            return BadRequest(new { message = "Mã OTP không hợp lệ hoặc đã hết hạn" });
        }

        return Ok(new { message = "Xác thực OTP thành công", verified = true });
    }
}

