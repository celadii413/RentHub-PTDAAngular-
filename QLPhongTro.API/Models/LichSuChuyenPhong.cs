namespace QLPhongTro.API.Models;

public class LichSuChuyenPhong
{
    public int Id { get; set; }
    public int KhachThueId { get; set; }
    public int PhongTroCuId { get; set; }
    public int PhongTroMoiId { get; set; }
    public DateTime NgayChuyen { get; set; } = DateTime.Now;
    public string? LyDo { get; set; }
    public string? GhiChu { get; set; }
    
    // Navigation properties
    public KhachThue? KhachThue { get; set; }
}

