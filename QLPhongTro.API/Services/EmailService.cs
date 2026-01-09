using System.Net;
using System.Net.Mail;

namespace QLPhongTro.API.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task<bool> SendEmailAsync(string toEmail, string subject, string body)
    {
        try
        {
            var smtpServer = _configuration["EmailSettings:SmtpServer"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
            var fromEmail = _configuration["EmailSettings:FromEmail"] ?? "";
            var fromPassword = _configuration["EmailSettings:FromPassword"] ?? "";

            if (string.IsNullOrEmpty(fromEmail) || string.IsNullOrEmpty(fromPassword))
            {
                _logger.LogWarning("Email settings not configured. Using default test mode.");
                // Trong môi trường development, chỉ log ra console
                _logger.LogInformation($"Email would be sent to: {toEmail}, Subject: {subject}");
                return true; // Return true để không block development
            }

            using var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail);

            using var smtpClient = new SmtpClient(smtpServer)
            {
                Port = smtpPort,
                Credentials = new NetworkCredential(fromEmail, fromPassword),
                EnableSsl = true
            };

            await smtpClient.SendMailAsync(mailMessage);
            _logger.LogInformation($"Email sent successfully to {toEmail}");
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to send email to {toEmail}");
            return false;
        }
    }

    public async Task<bool> SendOtpEmailAsync(string toEmail, string otpCode)
    {
        var subject = "Mã OTP xác thực - Hệ thống RentHub";
        var body = $@"
            <div style='font-family: Arial, sans-serif; padding: 20px; max-width: 600px; margin: 0 auto;'>
                <h2 style='color: #2c3e50;'>Mã OTP xác thực</h2>
                <p>Xin chào,</p>
                <p>Bạn đang thực hiện xác thực tài khoản trên hệ thống RentHub.</p>
                <div style='background-color: #f4f4f4; padding: 20px; text-align: center; margin: 20px 0; border-radius: 5px;'>
                    <h1 style='color: #e74c3c; font-size: 32px; letter-spacing: 5px; margin: 0;'>{otpCode}</h1>
                </div>
                <p>Mã OTP này có hiệu lực trong 10 phút. Vui lòng không chia sẻ mã này với bất kỳ ai.</p>
                <p>Nếu bạn không yêu cầu mã này, vui lòng bỏ qua email này.</p>
                <hr style='border: none; border-top: 1px solid #eee; margin: 20px 0;' />
                <p style='color: #7f8c8d; font-size: 12px;'>Đây là email tự động, vui lòng không trả lời email này.</p>
            </div>";

        return await SendEmailAsync(toEmail, subject, body);
    }

    public async Task<bool> SendEmailWithAttachmentAsync(string toEmail, string subject, string body, byte[] fileData, string fileName)
    {
        try
        {
            var smtpServer = _configuration["EmailSettings:SmtpServer"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_configuration["EmailSettings:SmtpPort"] ?? "587");
            var fromEmail = _configuration["EmailSettings:FromEmail"] ?? "";
            var fromPassword = _configuration["EmailSettings:FromPassword"] ?? "";

            using var mailMessage = new MailMessage
            {
                From = new MailAddress(fromEmail),
                Subject = subject,
                Body = body,
                IsBodyHtml = true
            };
            mailMessage.To.Add(toEmail);

            // --- ĐÍNH KÈM FILE ---
            using var stream = new MemoryStream(fileData);
            mailMessage.Attachments.Add(new Attachment(stream, fileName, "application/pdf"));

            using var smtpClient = new SmtpClient(smtpServer)
            {
                Port = smtpPort,
                Credentials = new NetworkCredential(fromEmail, fromPassword),
                EnableSsl = true
            };

            await smtpClient.SendMailAsync(mailMessage);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, $"Failed to send email with attachment to {toEmail}");
            return false;
        }
    }
}

