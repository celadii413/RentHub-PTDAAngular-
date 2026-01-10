using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using QLPhongTro.API.Data;
using QLPhongTro.API.DTOs;
using QLPhongTro.API.Models;

namespace QLPhongTro.API.Services;

public class AuthService : IAuthService
{
    private readonly ApplicationDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IOtpService _otpService;

    public AuthService(ApplicationDbContext context, IConfiguration configuration, IOtpService otpService)
    {
        _context = context;
        _configuration = configuration;
        _otpService = otpService;
    }

    public async Task<LoginResponseDTO?> LoginAsync(LoginDTO loginDto)
    {
        if (string.IsNullOrEmpty(loginDto.Username) || string.IsNullOrEmpty(loginDto.Password)) return null;

        var user = await _context.Users
            .FirstOrDefaultAsync(u => u.Username == loginDto.Username || u.Email == loginDto.Username);

        if (user == null || !user.IsActive) return null;
        if (!BCrypt.Net.BCrypt.Verify(loginDto.Password, user.PasswordHash)) return null;

        var token = GenerateJwtToken(user);

        int? dayTroId = null;
        if (user.VaiTro == "Chủ trọ")
        {
            var dayTro = await _context.DayTros.FirstOrDefaultAsync(d => d.UserId == user.Id);
            dayTroId = dayTro?.Id;
        }

        var activeTenant = await _context.KhachThues
            .FirstOrDefaultAsync(k => k.UserId == user.Id && k.NgayKetThucThue == null);

        return new LoginResponseDTO
        {
            Token = token,
            User = new UserDTO
            {
                Id = user.Id,
                Username = user.Username,
                Email = user.Email,
                HoTen = user.HoTen,
                SoDienThoai = user.SoDienThoai,
                VaiTro = user.VaiTro,
                DayTroId = dayTroId
            }
        };
    }

    public async Task<bool> RegisterAsync(RegisterDTO registerDto)
    {
        if (await _context.Users.AnyAsync(u => u.Username == registerDto.Username || u.Email == registerDto.Email)) return false;
        var user = new User { Username = registerDto.Username, Email = registerDto.Email, PasswordHash = BCrypt.Net.BCrypt.HashPassword(registerDto.Password), HoTen = registerDto.HoTen, SoDienThoai = registerDto.SoDienThoai, VaiTro = registerDto.VaiTro ?? "Người thuê", IsActive = true, NgayTao = DateTime.Now };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<bool> RegisterOwnerAsync(RegisterOwnerDTO dto)
    {
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email)) return false;
        var username = dto.Email.Split('@')[0];
        while (await _context.Users.AnyAsync(u => u.Username == username)) username += "1";
        var user = new User { Username = username, Email = dto.Email, PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password), HoTen = dto.HoTen, SoDienThoai = dto.SoDienThoai, VaiTro = "Chủ trọ", IsActive = true, NgayTao = DateTime.Now };
        _context.Users.Add(user);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<UserDTO?> GetUserByIdAsync(int id)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return null;

        int? dayTroId = null;
        if (user.VaiTro == "Chủ trọ")
        {
            var dayTro = await _context.DayTros.FirstOrDefaultAsync(d => d.UserId == user.Id);
            dayTroId = dayTro?.Id;
        }

        return new UserDTO
        {
            Id = user.Id,
            Username = user.Username,
            Email = user.Email,
            HoTen = user.HoTen,
            SoDienThoai = user.SoDienThoai,
            VaiTro = user.VaiTro,
            DayTroId = dayTroId,

            TenNganHang = user.TenNganHang,
            SoTaiKhoan = user.SoTaiKhoan,
            TenTaiKhoan = user.TenTaiKhoan
        };
    }

    public async Task<bool> UpdateProfileAsync(int id, UpdateProfileDTO dto)
    {
        var user = await _context.Users.FindAsync(id);
        if (user == null) return false;

        if (user.VaiTro == "Chủ trọ" || user.VaiTro == "Admin")
        {
            if (user.Email != dto.Email)
            {
                if (await _context.Users.AnyAsync(u => u.Email == dto.Email && u.Id != id)) return false;
                user.Email = dto.Email;
            }
        }

        user.HoTen = dto.HoTen;
        user.SoDienThoai = dto.SoDienThoai;
        user.NgayCapNhat = DateTime.Now;
        user.TenNganHang = dto.TenNganHang;
        user.SoTaiKhoan = dto.SoTaiKhoan;
        user.TenTaiKhoan = dto.TenTaiKhoan;

        // Cập nhật thông tin sang KhachThue active dựa trên UserId 
        if (user.VaiTro == "Người thuê")
        {
            var activeTenants = await _context.KhachThues
                .Where(k => k.UserId == user.Id && k.NgayKetThucThue == null)
                .ToListAsync();
            foreach (var t in activeTenants) { t.HoTen = user.HoTen; t.SoDienThoai = user.SoDienThoai; }
        }

        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<LoginResponseDTO?> LoginWithOtpAsync(string email, string otpCode)
    {
        if (!await _otpService.VerifyOtpAsync(email, otpCode, "Login")) return null;
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null || !user.IsActive) return null;

        var token = GenerateJwtToken(user);
        int? dayTroId = null;
        if (user.VaiTro == "Chủ trọ")
        {
            var dayTro = await _context.DayTros.FirstOrDefaultAsync(d => d.UserId == user.Id);
            dayTroId = dayTro?.Id;
        }

        return new LoginResponseDTO
        {
            Token = token,
            User = new UserDTO { Id = user.Id, Username = user.Username, Email = user.Email, HoTen = user.HoTen, SoDienThoai = user.SoDienThoai, VaiTro = user.VaiTro, DayTroId = dayTroId }
        };
    }

    public async Task<bool> RegisterTenantAsync(RegisterTenantDTO dto)
    {
        if (!await _otpService.VerifyOtpAsync(dto.Email, dto.OtpCode, "Register")) return false;
        if (await _context.Users.AnyAsync(u => u.Email == dto.Email)) return false;

        var username = dto.Email.Split('@')[0];
        while (await _context.Users.AnyAsync(u => u.Username == username)) username += "1";

        var user = new User
        {
            Username = username,
            Email = dto.Email,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
            HoTen = dto.HoTen,
            SoDienThoai = dto.SoDienThoai,
            VaiTro = "Người thuê",
            IsActive = true,
            NgayTao = DateTime.Now
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        //  Link User với KhachThue qua Email 
        var tenants = await _context.KhachThues.Where(k => k.Email == dto.Email).ToListAsync();
        foreach (var t in tenants) t.UserId = user.Id;
        if (tenants.Any()) await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> ChangePasswordAsync(int userId, ChangePasswordDTO dto)
    {
        var user = await _context.Users.FindAsync(userId);
        if (user == null || !BCrypt.Net.BCrypt.Verify(dto.OldPassword, user.PasswordHash)) return false;
        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        user.NgayCapNhat = DateTime.Now;
        await _context.SaveChangesAsync();
        return true;
    }
    public async Task<string?> ForgotPasswordAsync(string email)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        return user == null ? null : Guid.NewGuid().ToString();
    }
    public async Task<bool> ValidateOldPasswordAsync(int userId, string oldPassword)
    {
        var user = await _context.Users.FindAsync(userId);
        return user != null && BCrypt.Net.BCrypt.Verify(oldPassword, user.PasswordHash);
    }

    public async Task<bool> ChangePasswordWithOtpAsync(string email, string newPassword, string otpCode)
    {
        var otpRecord = await _context.OtpCodes
            .Where(o => o.Email == email && !o.IsUsed)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otpRecord == null)
        {
            throw new Exception("Không tìm thấy mã OTP nào cho email này (hoặc mã đã được sử dụng).");
        }

        if (otpRecord.ExpiryTime < DateTime.Now)
        {
            throw new Exception($"Mã đã hết hạn lúc {otpRecord.ExpiryTime}. Giờ Server: {DateTime.Now}");
        }

        if (otpRecord.Code.Trim() != otpCode.Trim())
        {
            throw new Exception($"Mã sai. DB đang lưu: '{otpRecord.Code}', Bạn nhập: '{otpCode}'");
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        if (user == null) throw new Exception("Không tìm thấy User với email này.");

        user.PasswordHash = BCrypt.Net.BCrypt.HashPassword(newPassword);
        user.NgayCapNhat = DateTime.Now;

        otpRecord.IsUsed = true;

        await _context.SaveChangesAsync();
        return true;
    }
    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("JwtSettings");
        var key = Encoding.ASCII.GetBytes(jwtSettings["SecretKey"] ?? "b58ec2c43121b68a82628c8fef842b518973e7b50acd83fe");
        var claims = new List<Claim> { new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()), new Claim(ClaimTypes.Name, user.Username), new Claim(ClaimTypes.Email, user.Email), new Claim(ClaimTypes.Role, user.VaiTro) };
        var tokenDescriptor = new SecurityTokenDescriptor { Subject = new ClaimsIdentity(claims), Expires = DateTime.UtcNow.AddDays(7), SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature) };
        return new JwtSecurityTokenHandler().WriteToken(new JwtSecurityTokenHandler().CreateToken(tokenDescriptor));
    }
}