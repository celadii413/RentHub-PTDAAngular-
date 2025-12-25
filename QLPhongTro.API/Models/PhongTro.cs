namespace QLPhongTro.API.Models;

public class PhongTro
{
    public int Id { get; set; }
    public string SoPhong { get; set; } = string.Empty;
    public string TenPhong { get; set; } = string.Empty;
    public string DiaChi { get; set; } = string.Empty;
    public int Tang { get; set; }
    public decimal GiaThue { get; set; }
    public decimal TienCoc { get; set; }
    public decimal DienTich { get; set; }
    public string MoTa { get; set; } = string.Empty;
    public string TrangThai { get; set; } = "Trống"; // Trống, Đã thuê, Đang sửa chữa
    public int DayTroId { get; set; }
    public DateTime NgayTao { get; set; } = DateTime.Now;
    public DateTime? NgayCapNhat { get; set; }

    public int GioiHanSoNguoi { get; set; }

    // Hình ảnh phòng
    public string? HinhAnh1 { get; set; }
    public string? HinhAnh2 { get; set; }
    public string? HinhAnh3 { get; set; }
    
    // Navigation properties
    public DayTro? DayTro { get; set; }
    public List<KhachThue>? KhachThues { get; set; }
    public List<HoaDon>? HoaDons { get; set; }
    public List<HopDong>? HopDongs { get; set; }
    public List<ChiSoCongTo>? ChiSoCongTos { get; set; }
}

