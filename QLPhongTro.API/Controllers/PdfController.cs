using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QLPhongTro.API.Services;

namespace QLPhongTro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class PdfController : ControllerBase
{
    private readonly IPdfService _pdfService;

    public PdfController(IPdfService pdfService)
    {
        _pdfService = pdfService;
    }

    [HttpGet("contract/{id}")]
    public async Task<IActionResult> DownloadContract(int id)
    {
        try
        {
            var pdfBytes = await _pdfService.GenerateContractPdfAsync(id);
            return File(pdfBytes, "application/pdf", $"HopDong_{id}.pdf");
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Lỗi khi tạo PDF: {ex.Message}" });
        }
    }

    [HttpGet("invoice/{id}")]
    public async Task<IActionResult> DownloadInvoice(int id)
    {
        try
        {
            var pdfBytes = await _pdfService.GenerateInvoicePdfAsync(id);
            return File(pdfBytes, "application/pdf", $"HoaDon_{id}.pdf");
        }
        catch (Exception ex)
        {
            return BadRequest(new { message = $"Lỗi khi tạo PDF: {ex.Message}" });
        }
    }
}

