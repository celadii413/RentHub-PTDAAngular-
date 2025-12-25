namespace QLPhongTro.API.Models;

public class HoaDon
{
    public int Id { get; set; }
    public string MaHoaDon { get; set; } = string.Empty;
    public int PhongTroId { get; set; }
    public DateTime ThangNam { get; set; }
    public decimal TienPhong { get; set; }
    public decimal TienDien { get; set; }
    public decimal TienNuoc { get; set; }
    public decimal TienInternet { get; set; }
    public decimal TienVeSinh { get; set; }
    public decimal CongNoThangTruoc { get; set; } // Công nợ tháng trước
    public decimal TongTien { get; set; }
    public string TrangThai { get; set; } = "Chưa thanh toán"; // Chưa thanh toán, Đã thanh toán, Quá hạn
    public DateTime? NgayThanhToan { get; set; }
    public string? PhuongThucThanhToan { get; set; } // Momo, VNPay, Chuyển khoản, Tiền mặt
    public string? MaGiaoDich { get; set; } // Mã giao dịch từ payment gateway
    public string? FileHoaDon { get; set; } // Đường dẫn file PDF hóa đơn
    public bool DaGuiEmail { get; set; } = false;
    public DateTime NgayTao { get; set; } = DateTime.Now;
    public string GhiChu { get; set; } = string.Empty;

    public string? AnhMinhChung { get; set; }

    // Navigation property
    public PhongTro? PhongTro { get; set; }

}

