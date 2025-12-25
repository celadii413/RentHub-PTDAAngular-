namespace QLPhongTro.API.Models;

public class ChiSoCongTo
{
    public int Id { get; set; }
    public int PhongTroId { get; set; }
    public string LoaiCongTo { get; set; } = string.Empty; // Điện, Nước
    public int ChiSoCu { get; set; }
    public int ChiSoMoi { get; set; }
    public int SoTieuThu { get; set; } // ChiSoMoi - ChiSoCu
    public DateTime ThangNam { get; set; }
    public DateTime NgayGhi { get; set; } = DateTime.Now;
    public string? GhiChu { get; set; }
    
    // Navigation property
    public PhongTro? PhongTro { get; set; }
}

