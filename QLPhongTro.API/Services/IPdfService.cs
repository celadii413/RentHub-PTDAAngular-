namespace QLPhongTro.API.Services;

public interface IPdfService
{
    Task<byte[]> GenerateContractPdfAsync(int hopDongId);
    Task<byte[]> GenerateInvoicePdfAsync(int hoaDonId);
}

