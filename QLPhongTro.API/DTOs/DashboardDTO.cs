namespace QLPhongTro.API.DTOs;

public class ThongKeDTO
{
    public int TongSoPhong { get; set; }
    public int PhongTrong { get; set; }
    public int PhongDaThue { get; set; }
    public int PhongDangSua { get; set; }
    public decimal DoanhThuThang { get; set; }
    public decimal TongCongNo { get; set; }
    public int HoaDonChuaThanhToan { get; set; }
}

public class DoanhThuThangDTO
{
    public int Thang { get; set; }
    public int Nam { get; set; }
    public decimal DoanhThu { get; set; }
}

public class TopPhongTieuThuDTO
{
    public int PhongTroId { get; set; }
    public string? SoPhong { get; set; }
    public int SoTieuThu { get; set; }
    public string LoaiCongTo { get; set; } = string.Empty;
}

public class BaoCaoCongNoDTO
{
    public int PhongTroId { get; set; }
    public string? SoPhong { get; set; }
    public decimal TongCongNo { get; set; }
    public int SoHoaDon { get; set; }
}

