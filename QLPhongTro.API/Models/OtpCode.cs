namespace QLPhongTro.API.Models;

public class OtpCode
{
    public int Id { get; set; }
    public string Email { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty; // 6 chữ số
    public DateTime ExpiryTime { get; set; }
    public bool IsUsed { get; set; } = false;
    public string Purpose { get; set; } = string.Empty; // "Register", "Login", "ResetPassword"
    public DateTime CreatedAt { get; set; } = DateTime.Now;
}

