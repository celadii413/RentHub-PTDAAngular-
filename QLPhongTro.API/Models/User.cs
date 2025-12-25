namespace QLPhongTro.API.Models;

public class User
{
    public int Id { get; set; }
    public string Username { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string HoTen { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public string VaiTro { get; set; } = "Nhân viên"; // Admin, Chủ trọ, Nhân viên, Người thuê
    public bool IsActive { get; set; } = true;
    public DateTime NgayTao { get; set; } = DateTime.Now;
    public DateTime? NgayCapNhat { get; set; }
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiryTime { get; set; }
    //public int? KhachThueId { get; set; } // Liên kết với khách thuê nếu là người thuê
    //public KhachThue? KhachThue { get; set; }
    public List<KhachThue>? LichSuThue { get; set; }

    public string? TenNganHang { get; set; } 
    public string? SoTaiKhoan { get; set; }
    public string? TenTaiKhoan { get; set; }
}

