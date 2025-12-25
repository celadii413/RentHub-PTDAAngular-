namespace QLPhongTro.API.Models;

public class HopDong
{
    public int Id { get; set; }
    public string MaHopDong { get; set; } = string.Empty;
    public int PhongTroId { get; set; }
    public int KhachThueId { get; set; }
    public DateTime NgayBatDau { get; set; }
    public DateTime NgayKetThuc { get; set; }
    public decimal GiaThue { get; set; }
    public decimal TienCoc { get; set; }
    public string TrangThai { get; set; } = "Đang hiệu lực"; // Đang hiệu lực, Đã kết thúc, Đã hủy
    public string? GhiChu { get; set; }
    public string? FileHopDong { get; set; } // Đường dẫn file PDF hợp đồng
    public DateTime NgayTao { get; set; } = DateTime.Now;
    public DateTime? NgayCapNhat { get; set; }
    
    // Navigation properties
    public PhongTro? PhongTro { get; set; }
    public KhachThue? KhachThue { get; set; }
}

