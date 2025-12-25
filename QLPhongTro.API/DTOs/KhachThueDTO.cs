namespace QLPhongTro.API.DTOs;

public class KhachThueDTO
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
    public string? SoPhong { get; set; }
}

public class CreateKhachThueDTO
{
    public string HoTen { get; set; } = string.Empty;
    public string SoDienThoai { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string CCCD { get; set; } = string.Empty;
    public DateTime NgaySinh { get; set; }
    public string GioiTinh { get; set; } = string.Empty;
    public string DiaChiThuongTru { get; set; } = string.Empty;
    public DateTime NgayBatDauThue { get; set; }
    public int PhongTroId { get; set; }
}

public class UpdateKhachThueDTO
{
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
}

