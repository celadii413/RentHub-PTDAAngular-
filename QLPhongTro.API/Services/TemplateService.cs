using PuppeteerSharp;
using PuppeteerSharp.Media;
using System.Reflection;
using System.Text;
using System.Threading; 

namespace QLPhongTro.API.Services;

public class TemplateService : ITemplateService
{
    private readonly IWebHostEnvironment _env;

    // Tạo một khóa tĩnh để ngăn chặn việc tải song song
    private static readonly SemaphoreSlim _downloadLock = new SemaphoreSlim(1, 1);
    private static bool _isBrowserDownloaded = false;

    public TemplateService(IWebHostEnvironment env)
    {
        _env = env;
    }

    public Task<string> GetMergedContentAsync<T>(string templateContent, T data)
    {
        var sb = new StringBuilder(templateContent);
        var properties = typeof(T).GetProperties(BindingFlags.Public | BindingFlags.Instance);

        foreach (var prop in properties)
        {
            var value = prop.GetValue(data)?.ToString() ?? "";
            sb.Replace($"{{{{{prop.Name.ToUpper()}}}}}", value);
        }

        return Task.FromResult(sb.ToString());
    }

    public async Task<byte[]> ConvertHtmlToPdfAsync(string htmlContent)
    {
        // ... (Giữ nguyên đoạn logic khóa Lock tải Chrome) ...
        if (!_isBrowserDownloaded)
        {
            await _downloadLock.WaitAsync();
            try
            {
                if (!_isBrowserDownloaded)
                {
                    var browserFetcher = new BrowserFetcher();
                    await browserFetcher.DownloadAsync();
                    _isBrowserDownloaded = true;
                }
            }
            finally { _downloadLock.Release(); }
        }
        // --------------------------------------------------

        using var browser = await Puppeteer.LaunchAsync(new LaunchOptions
        {
            Headless = true,
            Args = new[] { "--no-sandbox" }
        });

        using var page = await browser.NewPageAsync();

        // 1. Nhúng nội dung HTML vào trang
        await page.SetContentAsync(htmlContent);

        // 2. NHÚNG CSS ĐỂ FIX ĐỊNH DẠNG (QUAN TRỌNG)
        // Chúng ta phải định nghĩa lại các class mà Quill Editor sinh ra (.ql-align-center, .ql-size-large...)
        var cssContent = @"
            body { 
                font-family: 'Times New Roman', serif; 
                font-size: 14pt; 
                line-height: 1.5; 
                margin: 40px; 
                color: #000;
            }
            
            /* Căn lề */
            .ql-align-center { text-align: center; }
            .ql-align-right { text-align: right; }
            .ql-align-justify { text-align: justify; }

            /* Font chữ */
            .ql-font-times-new-roman { font-family: 'Times New Roman', serif; }
            .ql-font-arial { font-family: Arial, sans-serif; }
            
            /* Kích thước chữ (Quill dùng class thay vì px) */
            .ql-size-small { font-size: 10pt; }
            .ql-size-large { font-size: 18pt; }
            .ql-size-huge { font-size: 24pt; }

            /* Định dạng văn bản */
            strong, b { font-weight: bold; }
            em, i { font-style: italic; }
            u { text-decoration: underline; }

            /* Bảng biểu */
            table { 
                width: 100%; 
                border-collapse: collapse; 
                margin: 15px 0; 
            }
            th, td { 
                border: 1px solid black; 
                padding: 6px 10px; 
                vertical-align: top;
            }
            
            /* List */
            ul, ol { margin: 10px 0; padding-left: 30px; }
            li { margin-bottom: 5px; }

            /* Heading */
            h1 { font-size: 24pt; margin-bottom: 15px; text-align: center; font-weight: bold; }
            h2 { font-size: 18pt; margin-bottom: 10px; font-weight: bold; }
            h3 { font-size: 16pt; margin-bottom: 10px; font-weight: bold; }
        ";

        await page.AddStyleTagAsync(new AddTagOptions { Content = cssContent });

        // 3. Xuất PDF
        var pdfBytes = await page.PdfDataAsync(new PdfOptions
        {
            Format = PaperFormat.A4,
            PrintBackground = true,
            MarginOptions = new MarginOptions
            {
                Top = "10mm",
                Bottom = "10mm",
                Left = "15mm",  
                Right = "10mm"
            }
        });

        return pdfBytes;
    }
}