namespace QLPhongTro.API.Models;

public class ThongBao
{
    public int Id { get; set; }
    public string TieuDe { get; set; } = string.Empty;
    public string NoiDung { get; set; } = string.Empty;
    public int? DayTroId { get; set; } // null = thông báo cho tất cả, có giá trị = thông báo cho nhà trọ cụ thể
    public int? PhongTroId { get; set; } // null = thông báo cho tất cả phòng, có giá trị = thông báo cho phòng cụ thể
    public DateTime NgayTao { get; set; } = DateTime.Now;
    public int NguoiTaoId { get; set; } // ID người tạo thông báo (chủ trọ)
    
    // Navigation properties
    public DayTro? DayTro { get; set; }
    public PhongTro? PhongTro { get; set; }
    public User? NguoiTao { get; set; }
    public List<ThongBaoDaDoc>? ThongBaoDaDocs { get; set; }
}

public class ThongBaoDaDoc
{
    public int Id { get; set; }
    public int ThongBaoId { get; set; }
    public int UserId { get; set; }
    public DateTime NgayDoc { get; set; } = DateTime.Now;
    
    // Navigation properties
    public ThongBao? ThongBao { get; set; }
    public User? User { get; set; }
}

