namespace QLPhongTro.API.DTOs;

public class YeuCauChinhSuaDTO
{
    public int Id { get; set; }
    public int KhachThueId { get; set; }
    public int PhongTroId { get; set; }
    public string LoaiYeuCau { get; set; } = string.Empty;
    public string TieuDe { get; set; } = string.Empty;
    public string NoiDung { get; set; } = string.Empty;
    public string? AnhMinhHoa { get; set; }
    public string TrangThai { get; set; } = string.Empty;
    public string? PhanHoi { get; set; }
    public DateTime NgayTao { get; set; }
    public DateTime? NgayXuLy { get; set; }
}

public class CreateYeuCauChinhSuaDTO
{
    public int PhongTroId { get; set; }
    public string LoaiYeuCau { get; set; } = string.Empty;
    public string TieuDe { get; set; } = string.Empty;
    public string NoiDung { get; set; } = string.Empty;
    public string? AnhMinhHoa { get; set; }
}

public class PhanHoiYeuCauDTO
{
    public string PhanHoi { get; set; } = string.Empty;
    public string TrangThai { get; set; } = string.Empty; // "Đã tiếp nhận", "Đã xử lý", "Từ chối"
}

