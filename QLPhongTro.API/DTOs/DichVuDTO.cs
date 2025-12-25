namespace QLPhongTro.API.DTOs;

public class DichVuDTO
{
    public int Id { get; set; }
    public string TenDichVu { get; set; } = string.Empty;
    public string DonViTinh { get; set; } = string.Empty;
    public decimal GiaMacDinh { get; set; }
    public string LoaiGia { get; set; } = string.Empty;
    public int? DayTroId { get; set; }
    public string? TenDayTro { get; set; }
    public int? PhongTroId { get; set; }
    public string? SoPhong { get; set; }
    public bool IsActive { get; set; }
    public DateTime NgayTao { get; set; }
}

public class CreateDichVuDTO
{
    public string TenDichVu { get; set; } = string.Empty;
    public string DonViTinh { get; set; } = string.Empty;
    public decimal GiaMacDinh { get; set; }
    public string LoaiGia { get; set; } = "Theo phòng";
    public int? DayTroId { get; set; }
    public int? PhongTroId { get; set; }
}

public class UpdateDichVuDTO
{
    public string TenDichVu { get; set; } = string.Empty;
    public string DonViTinh { get; set; } = string.Empty;
    public decimal GiaMacDinh { get; set; }
    public string LoaiGia { get; set; } = string.Empty;
    public bool IsActive { get; set; }
}

