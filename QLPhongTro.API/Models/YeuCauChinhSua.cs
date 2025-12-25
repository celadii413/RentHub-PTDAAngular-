namespace QLPhongTro.API.Models;

public class YeuCauChinhSua
{
    public int Id { get; set; }
    public int KhachThueId { get; set; }
    public int PhongTroId { get; set; }
    public string LoaiYeuCau { get; set; } = string.Empty; // "Thông tin phòng", "Hợp đồng", "Hóa đơn", "Khác"
    public string TieuDe { get; set; } = string.Empty;
    public string NoiDung { get; set; } = string.Empty;
    public string? AnhMinhHoa { get; set; } // Đường dẫn ảnh đính kèm
    public string TrangThai { get; set; } = "Chờ xử lý"; // "Chờ xử lý", "Đã tiếp nhận", "Đã xử lý", "Từ chối"
    public string? PhanHoi { get; set; } // Phản hồi từ chủ trọ
    public DateTime NgayTao { get; set; } = DateTime.Now;
    public DateTime? NgayXuLy { get; set; }
    
    // Navigation properties
    public KhachThue? KhachThue { get; set; }
    public PhongTro? PhongTro { get; set; }
}

