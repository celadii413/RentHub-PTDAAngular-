using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using QLPhongTro.API.Data;
using QLPhongTro.API.DTOs;
using QLPhongTro.API.Services;
using System.Security.Claims;

namespace QLPhongTro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IOtpService _otpService;
    private readonly ApplicationDbContext _context;

    public AuthController(IAuthService authService, IOtpService otpService, ApplicationDbContext context)
    {
        _authService = authService;
        _otpService = otpService;
        _context = context;
    }

    [HttpPost("login")]
    public async Task<ActionResult<LoginResponseDTO>> Login([FromBody] LoginDTO loginDto)
    {
        if (loginDto == null || string.IsNullOrEmpty(loginDto.Username) || string.IsNullOrEmpty(loginDto.Password))
        {
            return BadRequest(new { message = "Vui lòng nhập đầy đủ thông tin" });
        }

        var result = await _authService.LoginAsync(loginDto);
        if (result == null)
            return Unauthorized(new { message = "Tên đăng nhập hoặc mật khẩu không đúng" });

        return Ok(result);
    }

    [HttpPost("register")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Register([FromBody] RegisterDTO registerDto)
    {
        var result = await _authService.RegisterAsync(registerDto);
        if (!result)
            return BadRequest(new { message = "Tên đăng nhập hoặc email đã tồn tại" });

        return Ok(new { message = "Đăng ký thành công" });
    }

    [HttpPost("register-owner")]
    public async Task<IActionResult> RegisterOwner([FromBody] RegisterOwnerDTO registerOwnerDto)
    {
        if (registerOwnerDto == null || string.IsNullOrEmpty(registerOwnerDto.Email) || string.IsNullOrEmpty(registerOwnerDto.Password))
        {
            return BadRequest(new { message = "Vui lòng nhập đầy đủ thông tin" });
        }

        // Validate email format
        if (!registerOwnerDto.Email.Contains('@') || !registerOwnerDto.Email.Contains('.'))
        {
            return BadRequest(new { message = "Email không hợp lệ" });
        }

        if (await _context.Users.AnyAsync(u => u.Email == registerOwnerDto.Email))
        {
            return BadRequest(new { message = "Email đã tồn tại trong hệ thống." });
        }

        // Validate password
        if (registerOwnerDto.Password.Length < 6)
        {
            return BadRequest(new { message = "Mật khẩu phải có ít nhất 6 ký tự" });
        }

        // Validate hoTen
        if (string.IsNullOrEmpty(registerOwnerDto.HoTen))
        {
            return BadRequest(new { message = "Vui lòng nhập họ và tên" });
        }

        // Validate soDienThoai
        if (string.IsNullOrEmpty(registerOwnerDto.SoDienThoai))
        {
            return BadRequest(new { message = "Vui lòng nhập số điện thoại" });
        }

        var result = await _authService.RegisterOwnerAsync(registerOwnerDto);
        if (!result)
            return BadRequest(new { message = "Đăng ký thất bại. Vui lòng thử lại." });

        return Ok(new { message = "Đăng ký thành công. Vui lòng đăng nhập." });
    }

    [HttpPost("login-with-otp")]
    public async Task<ActionResult<LoginResponseDTO>> LoginWithOtp([FromBody] LoginWithOtpDTO loginDto)
    {
        if (loginDto == null || string.IsNullOrEmpty(loginDto.Email) || string.IsNullOrEmpty(loginDto.OtpCode))
        {
            return BadRequest(new { message = "Vui lòng nhập đầy đủ thông tin" });
        }

        var result = await _authService.LoginWithOtpAsync(loginDto.Email, loginDto.OtpCode);
        if (result == null)
            return Unauthorized(new { message = "Email hoặc mã OTP không đúng" });

        return Ok(result);
    }

    [HttpPost("register-tenant")]
    public async Task<IActionResult> RegisterTenant([FromBody] RegisterTenantDTO registerDto)
    {
        if (registerDto == null || string.IsNullOrEmpty(registerDto.Email) || string.IsNullOrEmpty(registerDto.Password) || string.IsNullOrEmpty(registerDto.OtpCode))
        {
            return BadRequest(new { message = "Vui lòng nhập đầy đủ thông tin" });
        }

        if (await _context.Users.AnyAsync(u => u.Email == registerDto.Email))
        {
            return BadRequest(new { message = "Email đã tồn tại trong hệ thống." });
        }

        var result = await _authService.RegisterTenantAsync(registerDto);
        if (!result)
            return BadRequest(new { message = "Đăng ký thất bại. Vui lòng kiểm tra lại mã OTP và email." });

        return Ok(new { message = "Đăng ký thành công" });
    }

    [HttpPost("forgot-password")]
    public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDTO forgotPasswordDto)
    {
        var token = await _authService.ForgotPasswordAsync(forgotPasswordDto.Email);
        if (token == null)
            return NotFound(new { message = "Email không tồn tại" });

        return Ok(new { message = "Đã gửi email reset mật khẩu", token = token });
    }

    [HttpGet("profile")]
    [Authorize]
    public async Task<ActionResult<UserDTO>> GetProfile()
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var user = await _authService.GetUserByIdAsync(userId);
        if (user == null)
            return NotFound();

        return Ok(user);
    }

    [HttpPut("profile")]
    [Authorize]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDTO updateProfileDto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
        var result = await _authService.UpdateProfileAsync(userId, updateProfileDto);
        if (!result)
            return BadRequest(new { message = "Cập nhật thất bại" });

        return Ok(new { message = "Cập nhật thành công" });
    }

    // Đổi mật khẩu qua OTP

    [HttpPost("request-change-password-otp")]
    [Authorize]
    public async Task<IActionResult> RequestChangePasswordOtp([FromBody] RequestChangePasswordOtpDTO dto)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

        // Kiểm tra mật khẩu cũ
        var isPasswordCorrect = await _authService.ValidateOldPasswordAsync(userId, dto.OldPassword);
        if (!isPasswordCorrect)
        {
            return BadRequest(new { message = "Mật khẩu cũ không đúng" });
        }

        // Lấy email user
        var user = await _authService.GetUserByIdAsync(userId);
        if (user == null) return NotFound();

        // Gửi OTP qua email để thay đổi mật khẩu
        await _otpService.GenerateOtpAsync(user.Email, "ChangePassword");

        return Ok(new { 
            message = "Mật khẩu cũ chính xác. Mã OTP đã được gửi đến email của bạn." 
        });
    }

    [HttpPost("confirm-change-password")]
    [AllowAnonymous] 
    public async Task<IActionResult> ConfirmChangePassword([FromBody] ConfirmChangePasswordDTO dto)
    {
        try
        {
            if (string.IsNullOrEmpty(dto.Email)) 
                return BadRequest(new { message = "Vui lòng cung cấp Email." });
            
            if (dto.NewPassword.Length < 6) 
                return BadRequest(new { message = "Mật khẩu mới phải có ít nhất 6 ký tự" });
            var result = await _authService.ChangePasswordWithOtpAsync(dto.Email, dto.NewPassword, dto.OtpCode);

            return Ok(new { message = "Đổi mật khẩu thành công" });
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = ex.Message });
        }
    }

    
}