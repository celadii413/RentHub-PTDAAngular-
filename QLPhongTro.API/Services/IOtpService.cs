namespace QLPhongTro.API.Services;

public interface IOtpService
{
    Task<string> GenerateOtpAsync(string email, string purpose);
    Task<bool> VerifyOtpAsync(string email, string code, string purpose);
    Task<bool> InvalidateOtpAsync(string email, string purpose);
}

