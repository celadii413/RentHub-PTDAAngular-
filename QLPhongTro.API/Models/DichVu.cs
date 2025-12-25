namespace QLPhongTro.API.Models;

public class DichVu
{
    public int Id { get; set; }
    public string TenDichVu { get; set; } = string.Empty; // Điện, Nước, Internet, Rác
    public string DonViTinh { get; set; } = string.Empty; // kWh, m³, tháng, phòng
    public decimal GiaMacDinh { get; set; }
    public string LoaiGia { get; set; } = "Theo phòng"; // Theo phòng, Theo dãy, Chung
    public int? DayTroId { get; set; } // null nếu là giá chung
    public int? PhongTroId { get; set; } // null nếu là giá theo dãy hoặc chung
    public bool IsActive { get; set; } = true;
    public DateTime NgayTao { get; set; } = DateTime.Now;
    public DateTime? NgayCapNhat { get; set; }
    
    // Navigation properties
    public DayTro? DayTro { get; set; }
    public PhongTro? PhongTro { get; set; }
}

