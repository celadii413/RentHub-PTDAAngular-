namespace QLPhongTro.API.Models;
public class ChiPhi
{
    public int Id { get; set; }
    public string TenChiPhi { get; set; } = string.Empty;
    public decimal SoTien { get; set; }
    public string LoaiChiPhi { get; set; } = "Khác"; // Sửa chữa, Đầu tư, Điện lực...
    public DateTime NgayChi { get; set; }
    public string? GhiChu { get; set; }
    public int? DayTroId { get; set; } // Chi cho dãy nào (null = chi chung)
    public DayTro? DayTro { get; set; }
    public int UserId { get; set; } // Của chủ trọ nào
    public User? User { get; set; }
}