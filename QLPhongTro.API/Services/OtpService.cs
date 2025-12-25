using Microsoft.EntityFrameworkCore;
using QLPhongTro.API.Data;
using QLPhongTro.API.Models;

namespace QLPhongTro.API.Services;

public class OtpService : IOtpService
{
    private readonly ApplicationDbContext _context;
    private readonly IEmailService _emailService;
    private readonly Random _random = new();

    public OtpService(ApplicationDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    public async Task<string> GenerateOtpAsync(string email, string purpose)
    {
        // Xóa các OTP cũ cùng email và purpose
        var oldOtps = await _context.OtpCodes
            .Where(o => o.Email == email && o.Purpose == purpose)
            .ToListAsync();
        _context.OtpCodes.RemoveRange(oldOtps);

        // Tạo OTP mới 6 chữ số
        var otpCode = _random.Next(100000, 999999).ToString();

        var otp = new OtpCode
        {
            Email = email,
            Code = otpCode,
            Purpose = purpose,
            ExpiryTime = DateTime.Now.AddMinutes(10), // OTP hết hạn sau 10 phút
            IsUsed = false,
            CreatedAt = DateTime.Now
        };

        _context.OtpCodes.Add(otp);
        await _context.SaveChangesAsync();

        // Gửi email OTP
        await _emailService.SendOtpEmailAsync(email, otpCode);

        return otpCode;
    }

    public async Task<bool> VerifyOtpAsync(string email, string code, string purpose)
    {
        var otp = await _context.OtpCodes
            .Where(o => o.Email == email && 
                       o.Code == code && 
                       o.Purpose == purpose && 
                       !o.IsUsed &&
                       o.ExpiryTime > DateTime.Now)
            .OrderByDescending(o => o.CreatedAt)
            .FirstOrDefaultAsync();

        if (otp == null)
            return false;

        // Đánh dấu OTP đã sử dụng
        otp.IsUsed = true;
        await _context.SaveChangesAsync();

        return true;
    }

    public async Task<bool> InvalidateOtpAsync(string email, string purpose)
    {
        var otps = await _context.OtpCodes
            .Where(o => o.Email == email && o.Purpose == purpose && !o.IsUsed)
            .ToListAsync();

        foreach (var otp in otps)
        {
            otp.IsUsed = true;
        }

        await _context.SaveChangesAsync();
        return true;
    }
}

