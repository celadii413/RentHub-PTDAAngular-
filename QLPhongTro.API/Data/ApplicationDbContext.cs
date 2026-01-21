using Microsoft.EntityFrameworkCore;
using QLPhongTro.API.Models;

namespace QLPhongTro.API.Data;

public class ApplicationDbContext : DbContext
{
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
        : base(options)
    {
    }

    public DbSet<User> Users { get; set; }
    public DbSet<DayTro> DayTros { get; set; }
    public DbSet<PhongTro> PhongTros { get; set; }
    public DbSet<KhachThue> KhachThues { get; set; }
    public DbSet<HoaDon> HoaDons { get; set; }
    public DbSet<HopDong> HopDongs { get; set; }
    public DbSet<DichVu> DichVus { get; set; }
    public DbSet<ChiSoCongTo> ChiSoCongTos { get; set; }
    public DbSet<LichSuChuyenPhong> LichSuChuyenPhongs { get; set; }
    public DbSet<OtpCode> OtpCodes { get; set; }
    public DbSet<ThongBao> ThongBaos { get; set; }
    public DbSet<ThongBaoDaDoc> ThongBaoDaDocs { get; set; }
    public DbSet<YeuCauChinhSua> YeuCauChinhSuas { get; set; }
    public DbSet<ChiSoCongToGuiTuThue> ChiSoCongToGuiTuThues { get; set; }
    public DbSet<BieuMau> BieuMaus { get; set; }
    public DbSet<ChiPhi> ChiPhis { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Configure User
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Username).IsRequired().HasMaxLength(100);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.PasswordHash).IsRequired();
            entity.Property(e => e.VaiTro).HasMaxLength(50);
            entity.HasIndex(e => e.Username).IsUnique();
            entity.HasIndex(e => e.Email).IsUnique();
        });

        // Configure DayTro
        modelBuilder.Entity<DayTro>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TenDayTro).IsRequired().HasMaxLength(200);
            entity.Property(e => e.DiaChi).HasMaxLength(500);
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure PhongTro
        modelBuilder.Entity<PhongTro>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.SoPhong).IsRequired().HasMaxLength(50);
            entity.Property(e => e.TenPhong).IsRequired().HasMaxLength(200);
            entity.Property(e => e.GiaThue).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TienCoc).HasColumnType("decimal(18,2)");
            entity.Property(e => e.DienTich).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TrangThai).HasMaxLength(50);
            entity.HasIndex(e => e.SoPhong).IsUnique();
            entity.HasOne(e => e.DayTro)
                  .WithMany(d => d.PhongTros)
                  .HasForeignKey(e => e.DayTroId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure KhachThue
        modelBuilder.Entity<KhachThue>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.HoTen).IsRequired().HasMaxLength(200);
            entity.Property(e => e.SoDienThoai).HasMaxLength(20);
            entity.Property(e => e.Email).HasMaxLength(100);
            entity.Property(e => e.CCCD).HasMaxLength(20);
            entity.Property(e => e.GioiTinh).HasMaxLength(10);
            entity.HasOne(e => e.PhongTro)
                  .WithMany(p => p.KhachThues)
                  .HasForeignKey(e => e.PhongTroId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.KhachChinh)
                  .WithMany(k => k.NguoiOKem)
                  .HasForeignKey(e => e.KhachChinhId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.User)
                  .WithMany(u => u.LichSuThue)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.SetNull);
        });

        // Configure HoaDon
        modelBuilder.Entity<HoaDon>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.MaHoaDon).IsRequired().HasMaxLength(50);
            entity.Property(e => e.TienPhong).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TienDien).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TienNuoc).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TienInternet).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TienVeSinh).HasColumnType("decimal(18,2)");
            entity.Property(e => e.CongNoThangTruoc).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TongTien).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TrangThai).HasMaxLength(50);
            entity.Property(e => e.PhuongThucThanhToan).HasMaxLength(50);
            entity.HasIndex(e => e.MaHoaDon).IsUnique();
            entity.HasOne(e => e.PhongTro)
                  .WithMany(p => p.HoaDons)
                  .HasForeignKey(e => e.PhongTroId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure HopDong
        modelBuilder.Entity<HopDong>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.MaHopDong).IsRequired().HasMaxLength(50);
            entity.Property(e => e.GiaThue).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TienCoc).HasColumnType("decimal(18,2)");
            entity.Property(e => e.TrangThai).HasMaxLength(50);
            entity.HasIndex(e => e.MaHopDong).IsUnique();
            entity.HasOne(e => e.PhongTro)
                  .WithMany(p => p.HopDongs)
                  .HasForeignKey(e => e.PhongTroId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.KhachThue)
                  .WithMany(k => k.HopDongs)
                  .HasForeignKey(e => e.KhachThueId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure DichVu
        modelBuilder.Entity<DichVu>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TenDichVu).IsRequired().HasMaxLength(100);
            entity.Property(e => e.DonViTinh).HasMaxLength(50);
            entity.Property(e => e.GiaMacDinh).HasColumnType("decimal(18,2)");
            entity.Property(e => e.LoaiGia).HasMaxLength(50);
            entity.HasOne(e => e.DayTro)
                  .WithMany()
                  .HasForeignKey(e => e.DayTroId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.PhongTro)
                  .WithMany()
                  .HasForeignKey(e => e.PhongTroId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure ChiSoCongTo
        modelBuilder.Entity<ChiSoCongTo>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.LoaiCongTo).IsRequired().HasMaxLength(50);
            entity.HasOne(e => e.PhongTro)
                  .WithMany(p => p.ChiSoCongTos)
                  .HasForeignKey(e => e.PhongTroId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure LichSuChuyenPhong
        modelBuilder.Entity<LichSuChuyenPhong>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.KhachThue)
                  .WithMany(k => k.LichSuChuyenPhongs)
                  .HasForeignKey(e => e.KhachThueId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure OtpCode
        modelBuilder.Entity<OtpCode>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Email).IsRequired().HasMaxLength(200);
            entity.Property(e => e.Code).IsRequired().HasMaxLength(6);
            entity.Property(e => e.Purpose).HasMaxLength(50);
            entity.HasIndex(e => new { e.Email, e.Code, e.Purpose });
        });

        // Configure ThongBao
        modelBuilder.Entity<ThongBao>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TieuDe).IsRequired().HasMaxLength(200);
            entity.HasOne(e => e.DayTro)
                  .WithMany()
                  .HasForeignKey(e => e.DayTroId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.PhongTro)
                  .WithMany()
                  .HasForeignKey(e => e.PhongTroId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.NguoiTao)
                  .WithMany()
                  .HasForeignKey(e => e.NguoiTaoId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure ThongBaoDaDoc
        modelBuilder.Entity<ThongBaoDaDoc>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(e => e.ThongBao)
                  .WithMany(t => t.ThongBaoDaDocs)
                  .HasForeignKey(e => e.ThongBaoId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasIndex(e => new { e.ThongBaoId, e.UserId }).IsUnique();
        });

        // Configure YeuCauChinhSua
        modelBuilder.Entity<YeuCauChinhSua>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.LoaiYeuCau).IsRequired().HasMaxLength(50);
            entity.Property(e => e.TieuDe).IsRequired().HasMaxLength(200);
            entity.Property(e => e.TrangThai).HasMaxLength(50);
            entity.HasOne(e => e.KhachThue)
                  .WithMany(k => k.YeuCauChinhSuas)
                  .HasForeignKey(e => e.KhachThueId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.PhongTro)
                  .WithMany()
                  .HasForeignKey(e => e.PhongTroId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure ChiSoCongToGuiTuThue
        modelBuilder.Entity<ChiSoCongToGuiTuThue>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.LoaiCongTo).IsRequired().HasMaxLength(50);
            entity.Property(e => e.TrangThai).HasMaxLength(50);
            entity.HasOne(e => e.PhongTro)
                  .WithMany()
                  .HasForeignKey(e => e.PhongTroId)
                  .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(e => e.KhachThue)
                  .WithMany(k => k.ChiSoCongToGuiTuThues)
                  .HasForeignKey(e => e.KhachThueId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // Configure BieuMau
        modelBuilder.Entity<BieuMau>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TenBieuMau).IsRequired().HasMaxLength(200);
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<ChiPhi>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.Property(e => e.TenChiPhi).IsRequired().HasMaxLength(200);
            entity.Property(e => e.SoTien).HasColumnType("decimal(18,2)");
            entity.HasOne(e => e.DayTro)
                  .WithMany()
                  .HasForeignKey(e => e.DayTroId)
                  .OnDelete(DeleteBehavior.SetNull);
            entity.HasOne(e => e.User)
                  .WithMany()
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Restrict);
        });
    }
}

