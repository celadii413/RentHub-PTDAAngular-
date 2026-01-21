using System.IO;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace QLPhongTro.API.Services;

public class FileService : IFileService
{
    private readonly IWebHostEnvironment _environment;
    private readonly IConfiguration _configuration;
    private readonly ILogger<FileService> _logger;

    public FileService(
        IWebHostEnvironment environment,
        IConfiguration configuration,
        ILogger<FileService> logger)
    {
        _environment = environment;
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<string> SaveImageAsync(IFormFile file, string folderName)
    {
        try
        {
            // Kiểm tra file hợp lệ
            if (file == null || file.Length == 0)
                throw new ArgumentException("File không hợp lệ");

            // Kiểm tra loại file
            var allowedExtensions = new[] { ".jpg", ".jpeg", ".png", ".gif", ".webp" };
            var fileExtension = Path.GetExtension(file.FileName).ToLowerInvariant();
            if (!allowedExtensions.Contains(fileExtension))
                throw new ArgumentException("Chỉ chấp nhận file ảnh: .jpg, .jpeg, .png, .gif, .webp");

            // Kiểm tra kích thước file (tối đa 5MB)
            var maxSize = 5 * 1024 * 1024; // 5MB
            if (file.Length > maxSize)
                throw new ArgumentException("File ảnh không được vượt quá 5MB");

            // Tạo tên file duy nhất
            var fileName = $"{Guid.NewGuid()}{fileExtension}";
            
            // Tạo thư mục nếu chưa tồn tại
            var webRootPath = _environment.WebRootPath;
            if (string.IsNullOrEmpty(webRootPath))
            {
                webRootPath = Path.Combine(_environment.ContentRootPath, "wwwroot");
                if (!Directory.Exists(webRootPath))
                {
                    Directory.CreateDirectory(webRootPath);
                }
            }
            var uploadsFolder = Path.Combine(webRootPath, "uploads", folderName);
            if (!Directory.Exists(uploadsFolder))
            {
                Directory.CreateDirectory(uploadsFolder);
            }

            // Đường dẫn file đầy đủ
            var filePath = Path.Combine(uploadsFolder, fileName);

            // Lưu file
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            // Trả về đường dẫn tương đối để lưu vào database
            var relativePath = $"uploads/{folderName}/{fileName}";
            _logger.LogInformation($"File saved successfully: {relativePath}");
            
            return relativePath;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error saving file: {file?.FileName}");
            throw;
        }
    }

    public Task<bool> DeleteImageAsync(string filePath)
    {
        try
        {
            if (string.IsNullOrEmpty(filePath))
                return Task.FromResult(false);

            var webRootPath = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
            var fullPath = Path.Combine(webRootPath, filePath);
            
            if (File.Exists(fullPath))
            {
                File.Delete(fullPath);
                _logger.LogInformation($"File deleted: {filePath}");
                return Task.FromResult(true);
            }

            return Task.FromResult(false);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Error deleting file: {filePath}");
            return Task.FromResult(false);
        }
    }

    public string GetImageUrl(string filePath)
    {
        if (string.IsNullOrEmpty(filePath)) return string.Empty;
        if (filePath.StartsWith("http")) return filePath;

        var relativePath = filePath.Replace("\\", "/").TrimStart('/');

        // Lấy BaseUrl từ appsettings hoặc hardcode đúng port backend đang chạy
        var baseUrl = _configuration["BaseUrl"] ?? "http://localhost:5000";

        // Kết quả phải là: http://localhost:5000/uploads/folder/file.jpg
        return $"{baseUrl}/{relativePath}";
    }
}

