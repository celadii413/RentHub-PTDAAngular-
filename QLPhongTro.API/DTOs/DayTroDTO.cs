namespace QLPhongTro.API.DTOs;

public class DayTroDTO
{
    public int Id { get; set; }
    public string TenDayTro { get; set; } = string.Empty;
    public string DiaChi { get; set; } = string.Empty;
    public int SoTang { get; set; }
    public int SoPhongMoiTang { get; set; }
    public string MoTa { get; set; } = string.Empty;
    public DateTime NgayTao { get; set; }
    public int TongSoPhong { get; set; }
}

public class CreateDayTroDTO
{
    public string TenDayTro { get; set; } = string.Empty;
    public string DiaChi { get; set; } = string.Empty;
    public int SoTang { get; set; }
    public int SoPhongMoiTang { get; set; }
    public string MoTa { get; set; } = string.Empty;
}

public class UpdateDayTroDTO
{
    public string TenDayTro { get; set; } = string.Empty;
    public string DiaChi { get; set; } = string.Empty;
    public int SoTang { get; set; }
    public int SoPhongMoiTang { get; set; }
    public string MoTa { get; set; } = string.Empty;
}

