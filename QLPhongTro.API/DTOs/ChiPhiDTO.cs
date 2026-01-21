namespace QLPhongTro.API.DTOs
{
    public class ChiPhiDTO
    {
        public int Id { get; set; }
        public string TenChiPhi { get; set; }
        public decimal SoTien { get; set; }
        public string LoaiChiPhi { get; set; }
        public DateTime NgayChi { get; set; }
        public string? GhiChu { get; set; }
        public int? DayTroId { get; set; }
        public string? TenDayTro { get; set; }
    }
    public class CreateChiPhiDTO
    {
        public string TenChiPhi { get; set; }
        public decimal SoTien { get; set; }
        public string LoaiChiPhi { get; set; }
        public DateTime NgayChi { get; set; }
        public string? GhiChu { get; set; }
        public int? DayTroId { get; set; }
    }
}
