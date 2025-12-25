namespace QLPhongTro.API.Models;

public class KhachThue
{
    public int Id { get; set; }
    public string HoTen { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string CCCD { get; set; } = string.Empty;
    public DateTime NgaySinh { get; set; }
    public string GioiTinh { get; set; } = string.Empty;
    public string DiaChiThuongTru { get; set; } = string.Empty;
    public DateTime NgayBatDauThue { get; set; }
    public DateTime? NgayKetThucThue { get; set; }
    public int PhongTroId { get; set; }
    public bool LaKhachChinh { get; set; } = false; // Khách chính hay người ở kèm
    public int? KhachChinhId { get; set; } // ID của khách chính nếu là người ở kèm
    public string? AnhCCCDMatTruoc { get; set; } // Đường dẫn ảnh CMND mặt trước
    public string? AnhCCCDMatSau { get; set; } // Đường dẫn ảnh CMND mặt sau
    public DateTime NgayTao { get; set; } = DateTime.Now;

    public int? UserId { get; set; }
    public User? User { get; set; }
    public string? TrangThaiCoc { get; set; }


    // Navigation properties
    public PhongTro? PhongTro { get; set; }
    public KhachThue? KhachChinh { get; set; }
    public List<KhachThue>? NguoiOKem { get; set; }
    public List<HopDong>? HopDongs { get; set; }
    public List<LichSuChuyenPhong>? LichSuChuyenPhongs { get; set; }
    public List<YeuCauChinhSua>? YeuCauChinhSuas { get; set; }
    public List<ChiSoCongToGuiTuThue>? ChiSoCongToGuiTuThues { get; set; }
}

