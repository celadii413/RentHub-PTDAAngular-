using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using QLPhongTro.API.Services;

namespace QLPhongTro.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FileUploadController : ControllerBase
{
    private readonly IFileService _fileService;
    private readonly ILogger<FileUploadController> _logger;

    public FileUploadController(IFileService fileService, ILogger<FileUploadController> logger)
    {
        _fileService = fileService;
        _logger = logger;
    }

    // Upload ảnh cho yêu cầu chỉnh sửa
    [HttpPost("edit-request")]
    [Authorize(Roles = "Người thuê")]
    public async Task<IActionResult> UploadEditRequestImage(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Vui lòng chọn file ảnh" });

            var filePath = await _fileService.SaveImageAsync(file, "edit-requests");
            var fileUrl = _fileService.GetImageUrl(filePath);

            return Ok(new
            {
                message = "Upload ảnh thành công",
                filePath = filePath,
                fileUrl = fileUrl
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading edit request image");
            return StatusCode(500, new { message = "Lỗi khi upload ảnh" });
        }
    }

    // Upload ảnh công tơ điện/nước
    [HttpPost("meter-reading")]
    [Authorize(Roles = "Người thuê")]
    public async Task<IActionResult> UploadMeterReadingImage(IFormFile file)
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Vui lòng chọn file ảnh" });

            var filePath = await _fileService.SaveImageAsync(file, "meter-readings");
            var fileUrl = _fileService.GetImageUrl(filePath);

            return Ok(new
            {
                message = "Upload ảnh thành công",
                filePath = filePath,
                fileUrl = fileUrl
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading meter reading image");
            return StatusCode(500, new { message = "Lỗi khi upload ảnh" });
        }
    }

    // Upload ảnh chung (có thể dùng cho nhiều mục đích)
    [HttpPost("image")]
    public async Task<IActionResult> UploadImage(IFormFile file, [FromQuery] string folder = "general")
    {
        try
        {
            if (file == null || file.Length == 0)
                return BadRequest(new { message = "Vui lòng chọn file ảnh" });

            var filePath = await _fileService.SaveImageAsync(file, folder);
            var fileUrl = _fileService.GetImageUrl(filePath);

            return Ok(new
            {
                message = "Upload ảnh thành công",
                filePath = filePath,
                fileUrl = fileUrl
            });
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading image");
            return StatusCode(500, new { message = "Lỗi khi upload ảnh" });
        }
    }

    // Xóa ảnh
    [HttpDelete("image")]
    public async Task<IActionResult> DeleteImage([FromQuery] string filePath)
    {
        try
        {
            var result = await _fileService.DeleteImageAsync(filePath);
            if (result)
                return Ok(new { message = "Xóa ảnh thành công" });
            else
                return NotFound(new { message = "Không tìm thấy file" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting image");
            return StatusCode(500, new { message = "Lỗi khi xóa ảnh" });
        }
    }
}

