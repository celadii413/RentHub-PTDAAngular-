namespace QLPhongTro.API.DTOs;

public class HopDongDTO
{
    public int Id { get; set; }
    public string MaHopDong { get; set; } = string.Empty;
    public int PhongTroId { get; set; }
    public string? SoPhong { get; set; }
    public int KhachThueId { get; set; }
    public string? TenKhachThue { get; set; }
    public DateTime NgayBatDau { get; set; }
    public DateTime NgayKetThuc { get; set; }
    public decimal GiaThue { get; set; }
    public decimal TienCoc { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public string? GhiChu { get; set; }
    public string? FileHopDong { get; set; }
    public DateTime NgayTao { get; set; }
}

public class CreateHopDongDTO
{
    public int PhongTroId { get; set; }
    public int KhachThueId { get; set; }
    public DateTime NgayBatDau { get; set; }
    public DateTime NgayKetThuc { get; set; }
    public decimal GiaThue { get; set; }
    public decimal TienCoc { get; set; }
    public string? GhiChu { get; set; }
}

public class UpdateHopDongDTO
{
    public DateTime NgayBatDau { get; set; }
    public DateTime NgayKetThuc { get; set; }
    public decimal GiaThue { get; set; }
    public decimal TienCoc { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public string? GhiChu { get; set; }
}

public class GiaHanHopDongDTO
{
    public DateTime NgayKetThucMoi { get; set; }
}

