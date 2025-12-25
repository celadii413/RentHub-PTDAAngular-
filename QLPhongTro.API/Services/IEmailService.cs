namespace QLPhongTro.API.Services;

public interface IEmailService
{
    Task<bool> SendEmailAsync(string toEmail, string subject, string body);
    Task<bool> SendOtpEmailAsync(string toEmail, string otpCode);

    Task<bool> SendEmailWithAttachmentAsync(string toEmail, string subject, string body, byte[] fileData, string fileName);
}

