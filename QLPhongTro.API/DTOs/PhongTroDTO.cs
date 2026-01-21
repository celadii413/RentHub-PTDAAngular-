namespace QLPhongTro.API.DTOs;

public class PhongTroDTO
{
    public int Id { get; set; }
    public string SoPhong { get; set; } = string.Empty;
    public string TenPhong { get; set; } = string.Empty;
    public int Tang { get; set; }
    public decimal GiaThue { get; set; }
    public decimal TienCoc { get; set; }
    public decimal DienTich { get; set; }
    public string MoTa { get; set; } = string.Empty;
    public string TrangThai { get; set; } = string.Empty;
    public int DayTroId { get; set; }
    public string? TenDayTro { get; set; }
    public DateTime NgayTao { get; set; }
    public int SoKhachThue { get; set; }
    public string? HinhAnh1 { get; set; }
    public string? HinhAnh2 { get; set; }
    public string? HinhAnh3 { get; set; }

    public int GioiHanSoNguoi { get; set; }

    public int ChiSoDienMoiNhat { get; set; } 
    public int ChiSoNuocMoiNhat { get; set; }
}

public class CreatePhongTroDTO
{
    public string SoPhong { get; set; } = string.Empty;
    public string TenPhong { get; set; } = string.Empty;
    public int Tang { get; set; }
    public decimal GiaThue { get; set; }
    public decimal TienCoc { get; set; }
    public decimal DienTich { get; set; }
    public string MoTa { get; set; } = string.Empty;
    public string TrangThai { get; set; } = "Trống";
    public int DayTroId { get; set; }

    public int GioiHanSoNguoi { get; set; }
}

public class UpdatePhongTroDTO
{
    public string TenPhong { get; set; } = string.Empty;
    public int Tang { get; set; }
    public decimal GiaThue { get; set; }
    public decimal TienCoc { get; set; }
    public decimal DienTich { get; set; }
    public string MoTa { get; set; } = string.Empty;
    public string TrangThai { get; set; } = string.Empty;
    public int DayTroId { get; set; }
    public string? HinhAnh1 { get; set; }
    public string? HinhAnh2 { get; set; }
    public string? HinhAnh3 { get; set; }

    public int GioiHanSoNguoi { get; set; }
}

