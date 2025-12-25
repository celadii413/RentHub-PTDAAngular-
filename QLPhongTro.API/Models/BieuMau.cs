using System.ComponentModel.DataAnnotations;

namespace QLPhongTro.API.Models;

public class BieuMau
{
    public int Id { get; set; }
    public string TenBieuMau { get; set; } = string.Empty; 
    public string LoaiBieuMau { get; set; } = string.Empty; 
    public string NoiDung { get; set; } = string.Empty; 
    public int? UserId { get; set; }
    public User? User { get; set; }
    public DateTime NgayCapNhat { get; set; } = DateTime.Now;
}