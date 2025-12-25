namespace QLPhongTro.API.DTOs;

// DTO dùng để gửi dữ liệu trộn vào Hợp đồng
public class HopDongPrintDTO
{
    public string MA_HOP_DONG { get; set; } = string.Empty;
    public string TEN_PHONG { get; set; } = string.Empty;
    public string GIA_THUE { get; set; } = string.Empty;
    public string TIEN_COC { get; set; } = string.Empty;
    public string NGAY_BAT_DAU { get; set; } = string.Empty;
    public string NGAY_KET_THUC { get; set; } = string.Empty;
    public string TEN_KHACH { get; set; } = string.Empty;
    public string CCCD { get; set; } = string.Empty;
    public string DIA_CHI_THUONG_TRU { get; set; } = string.Empty;
    public string SO_DIEN_THOAI { get; set; } = string.Empty;
    public string TEN_CHU_TRO { get; set; } = string.Empty;
    public string SDT_CHU_TRO { get; set; } = string.Empty;

    // --- BỔ SUNG TRƯỜNG NÀY ---
    public string NGAY_TAO { get; set; } = string.Empty;
}

// DTO dùng để gửi dữ liệu trộn vào Hóa đơn
public class HoaDonPrintDTO
{
    public string MA_HOA_DON { get; set; } = string.Empty;
    public string TEN_PHONG { get; set; } = string.Empty;
    public string THANG_NAM { get; set; } = string.Empty;
    public string TIEN_PHONG { get; set; } = string.Empty;
    public string TIEN_DIEN { get; set; } = string.Empty;
    public string TIEN_NUOC { get; set; } = string.Empty;
    public string TIEN_DICH_VU { get; set; } = string.Empty;
    public string CONG_NO { get; set; } = string.Empty;
    public string TONG_TIEN { get; set; } = string.Empty;
    public string TEN_KHACH { get; set; } = string.Empty;
}

// DTO để quản lý danh sách và lưu biểu mẫu
public class BieuMauDTO
{
    public int Id { get; set; }
    public string TenBieuMau { get; set; } = string.Empty;
    public string LoaiBieuMau { get; set; } = string.Empty;
    public string NoiDung { get; set; } = string.Empty;
}

// DTO request xuất PDF
public class ExportPdfRequest
{
    public string HtmlContent { get; set; } = string.Empty;
}