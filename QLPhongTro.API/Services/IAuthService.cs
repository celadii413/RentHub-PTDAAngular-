using QLPhongTro.API.DTOs;

namespace QLPhongTro.API.Services;

public interface IAuthService
{
    Task<LoginResponseDTO?> LoginAsync(LoginDTO loginDto);
    Task<LoginResponseDTO?> LoginWithOtpAsync(string email, string otpCode);
    Task<bool> RegisterAsync(RegisterDTO registerDto);
    Task<bool> RegisterOwnerAsync(RegisterOwnerDTO registerOwnerDto);
    Task<bool> RegisterTenantAsync(RegisterTenantDTO registerDto);
    Task<bool> ChangePasswordAsync(int userId, ChangePasswordDTO changePasswordDto);
    Task<string?> ForgotPasswordAsync(string email);
    Task<UserDTO?> GetUserByIdAsync(int id);
    Task<bool> UpdateProfileAsync(int id, UpdateProfileDTO updateProfileDto);
    Task<bool> ValidateOldPasswordAsync(int userId, string oldPassword); 
    Task<bool> ChangePasswordWithOtpAsync(int userId, string newPassword, string otpCode); 
}

