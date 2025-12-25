namespace QLPhongTro.API.DTOs;

public class ChiSoCongToDTO
{
    public int Id { get; set; }
    public int PhongTroId { get; set; }
    public string? SoPhong { get; set; }
    public string LoaiCongTo { get; set; } = string.Empty;
    public int ChiSoCu { get; set; }
    public int ChiSoMoi { get; set; }
    public int SoTieuThu { get; set; }
    public DateTime ThangNam { get; set; }
    public DateTime NgayGhi { get; set; }
    public string? GhiChu { get; set; }
}

public class CreateChiSoCongToDTO
{
    public int PhongTroId { get; set; }
    public string LoaiCongTo { get; set; } = string.Empty;
    public int ChiSoCu { get; set; }
    public int ChiSoMoi { get; set; }
    public DateTime ThangNam { get; set; }
    public string? GhiChu { get; set; }
}

public class UpdateChiSoCongToDTO
{
    public int ChiSoCu { get; set; }
    public int ChiSoMoi { get; set; }
    public DateTime ThangNam { get; set; }
    public string? GhiChu { get; set; }
}

public class GoiYChiSoDTO
{
    public int ChiSoCu { get; set; }
    public int ChiSoMoiGoiY { get; set; }
    public DateTime? ThangNamCu { get; set; }
}

