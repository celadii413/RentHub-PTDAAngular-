namespace QLPhongTro.API.Models;

public class DayTro
{
    public int Id { get; set; }
    public string TenDayTro { get; set; } = string.Empty;
    public string DiaChi { get; set; } = string.Empty;
    public int SoTang { get; set; }
    public int SoPhongMoiTang { get; set; }
    public string MoTa { get; set; } = string.Empty;
    public DateTime NgayTao { get; set; } = DateTime.Now;
    public DateTime? NgayCapNhat { get; set; }
    
    // Foreign key to User (Chủ trọ)
    public int? UserId { get; set; }
    
    // Navigation properties
    public User? User { get; set; }
    public List<PhongTro>? PhongTros { get; set; }
}

