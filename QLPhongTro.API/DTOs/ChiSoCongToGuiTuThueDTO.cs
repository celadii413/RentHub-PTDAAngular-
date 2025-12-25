namespace QLPhongTro.API.DTOs;

public class ChiSoCongToGuiTuThueDTO
{
    public int Id { get; set; }
    public int PhongTroId { get; set; }
    public string LoaiCongTo { get; set; } = string.Empty;
    public int ChiSo { get; set; }
    public DateTime ThangNam { get; set; }
    public string? AnhCongTo { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public string? GhiChu { get; set; }
    public DateTime NgayGui { get; set; }
    public DateTime? NgayXacNhan { get; set; }
}

public class CreateChiSoCongToGuiTuThueDTO
{
    public int PhongTroId { get; set; }
    public string LoaiCongTo { get; set; } = string.Empty;
    public int ChiSo { get; set; }
    public DateTime ThangNam { get; set; }
    public string? AnhCongTo { get; set; }
    public string? GhiChu { get; set; }
}

