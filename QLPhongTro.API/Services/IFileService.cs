namespace QLPhongTro.API.Services;

public interface IFileService
{
    Task<string> SaveImageAsync(IFormFile file, string folderName);
    Task<bool> DeleteImageAsync(string filePath);
    string GetImageUrl(string filePath);
}

