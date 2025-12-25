namespace QLPhongTro.API.DTOs;

public class ChuyenPhongDTO
{
    public int PhongTroMoiId { get; set; }
    public string? LyDo { get; set; }
    public string? GhiChu { get; set; }
}

public class TraPhongDTO
{
    public DateTime? NgayTraPhong { get; set; }
    public string? GhiChu { get; set; }

    public string? TrangThaiCoc { get; set; }
}

public class LichSuChuyenPhongDTO
{
    public int Id { get; set; }
    public int PhongTroCuId { get; set; }
    public int PhongTroMoiId { get; set; }
    public DateTime NgayChuyen { get; set; }
    public string? LyDo { get; set; }
    public string? GhiChu { get; set; }
}

