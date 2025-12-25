namespace QLPhongTro.API.DTOs;

public class LoginDTO
{
    public string Username { get; set; } = string.Empty; // Có thể là username hoặc email
    public string Password { get; set; } = string.Empty;
}

public class RegisterDTO
{
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string HoTen { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public string? VaiTro { get; set; }
}

public class ChangePasswordDTO
{
    public string OldPassword { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class ForgotPasswordDTO
{
    public string Email { get; set; } = string.Empty;
}

public class ResetPasswordDTO
{
    public string Token { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}

public class LoginResponseDTO
{
    public string Token { get; set; } = string.Empty;
    public UserDTO User { get; set; } = null!;
}

public class UserDTO
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string HoTen { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public string VaiTro { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public int? DayTroId { get; set; } // ID nhà trọ mà user quản lý

    public string? TenNganHang { get; set; }
    public string? SoTaiKhoan { get; set; }
    public string? TenTaiKhoan { get; set; }
}

public class UpdateProfileDTO
{
    public string HoTen { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;

    public string? TenNganHang { get; set; }
    public string? SoTaiKhoan { get; set; }
    public string? TenTaiKhoan { get; set; }
}

// DTO cho đăng ký chủ trọ (công khai) - chỉ cần thông tin tài khoản
public class RegisterOwnerDTO
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string HoTen { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
}

public class SendOtpDTO
{
    public string Email { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty; // "Register", "Login"
}

public class VerifyOtpDTO
{
    public string Email { get; set; } = string.Empty;
    public string Code { get; set; } = string.Empty;
    public string Purpose { get; set; } = string.Empty;
}

public class LoginWithOtpDTO
{
    public string Email { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
}

public class RegisterTenantDTO
{
    public string Email { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string OtpCode { get; set; } = string.Empty;
    public string HoTen { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
}

public class RequestChangePasswordOtpDTO
{
    public string OldPassword { get; set; } = string.Empty;
}

public class ConfirmChangePasswordDTO
{
    public string OtpCode { get; set; } = string.Empty;
    public string NewPassword { get; set; } = string.Empty;
}