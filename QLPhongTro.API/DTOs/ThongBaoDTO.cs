namespace QLPhongTro.API.DTOs;

public class ThongBaoDTO
{
    public int Id { get; set; }
    public string TieuDe { get; set; } = string.Empty;
    public string NoiDung { get; set; } = string.Empty;
    public int? DayTroId { get; set; }
    public int? PhongTroId { get; set; }
    public DateTime NgayTao { get; set; }
    public bool DaDoc { get; set; }
}

public class CreateThongBaoDTO
{
    public string TieuDe { get; set; } = string.Empty;
    public string NoiDung { get; set; } = string.Empty;
    public int? DayTroId { get; set; }
    public int? PhongTroId { get; set; }
}

