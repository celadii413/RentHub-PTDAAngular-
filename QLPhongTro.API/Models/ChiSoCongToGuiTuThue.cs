namespace QLPhongTro.API.Models;

public class ChiSoCongToGuiTuThue
{
    public int Id { get; set; }
    public int PhongTroId { get; set; }
    public int KhachThueId { get; set; }
    public string LoaiCongTo { get; set; } = string.Empty; // "Điện", "Nước"
    public int ChiSo { get; set; }
    public DateTime ThangNam { get; set; }
    public string? AnhCongTo { get; set; } // Đường dẫn ảnh công tơ
    public string TrangThai { get; set; } = "Chờ xác nhận"; // "Chờ xác nhận", "Đã xác nhận", "Từ chối"
    public string? GhiChu { get; set; }
    public DateTime NgayGui { get; set; } = DateTime.Now;
    public DateTime? NgayXacNhan { get; set; }
    
    // Navigation properties
    public PhongTro? PhongTro { get; set; }
    public KhachThue? KhachThue { get; set; }
}

