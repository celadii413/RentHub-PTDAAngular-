namespace QLPhongTro.API.Services;

public interface ITemplateService
{
    Task<string> GetMergedContentAsync<T>(string templateContent, T data);
    Task<byte[]> ConvertHtmlToPdfAsync(string htmlContent);
}