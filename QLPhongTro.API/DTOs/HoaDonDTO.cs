namespace QLPhongTro.API.DTOs;

public class HoaDonDTO
{
    public int Id { get; set; }
    public string MaHoaDon { get; set; } = string.Empty;
    public int PhongTroId { get; set; }
    public string? SoPhong { get; set; }
    public DateTime ThangNam { get; set; }
    public decimal TienPhong { get; set; }
    public decimal TienDien { get; set; }
    public decimal TienNuoc { get; set; }
    public decimal TienInternet { get; set; }
    public decimal TienVeSinh { get; set; }
    public decimal CongNoThangTruoc { get; set; }
    public decimal TongTien { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public DateTime? NgayThanhToan { get; set; }
    public string? PhuongThucThanhToan { get; set; }
    public DateTime NgayTao { get; set; }
    public string GhiChu { get; set; } = string.Empty;

    public string? AnhMinhChung { get; set; }

    public string? ChuTro_TenNganHang { get; set; }
    public string? ChuTro_SoTaiKhoan { get; set; }
    public string? ChuTro_TenTaiKhoan { get; set; }
}

public class CreateHoaDonDTO
{
    public int PhongTroId { get; set; }
    public DateTime ThangNam { get; set; }
    public decimal TienPhong { get; set; }
    public decimal TienDien { get; set; }
    public decimal TienNuoc { get; set; }
    public decimal TienInternet { get; set; }
    public decimal TienVeSinh { get; set; }
    public string GhiChu { get; set; } = string.Empty;
}

public class UpdateHoaDonDTO
{
    public DateTime ThangNam { get; set; }
    public decimal TienPhong { get; set; }
    public decimal TienDien { get; set; }
    public decimal TienNuoc { get; set; }
    public decimal TienInternet { get; set; }
    public decimal TienVeSinh { get; set; }
    public decimal CongNoThangTruoc { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public DateTime? NgayThanhToan { get; set; }
    public string? PhuongThucThanhToan { get; set; }
    public string GhiChu { get; set; } = string.Empty;
}

