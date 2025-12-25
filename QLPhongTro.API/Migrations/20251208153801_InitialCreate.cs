using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QLPhongTro.API.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "OtpCodes",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Code = table.Column<string>(type: "nvarchar(6)", maxLength: 6, nullable: false),
                    ExpiryTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    IsUsed = table.Column<bool>(type: "bit", nullable: false),
                    Purpose = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OtpCodes", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ChiSoCongToGuiTuThues",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PhongTroId = table.Column<int>(type: "int", nullable: false),
                    KhachThueId = table.Column<int>(type: "int", nullable: false),
                    LoaiCongTo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ChiSo = table.Column<int>(type: "int", nullable: false),
                    ThangNam = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AnhCongTo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    GhiChu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayGui = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NgayXacNhan = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChiSoCongToGuiTuThues", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "ChiSoCongTos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PhongTroId = table.Column<int>(type: "int", nullable: false),
                    LoaiCongTo = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ChiSoCu = table.Column<int>(type: "int", nullable: false),
                    ChiSoMoi = table.Column<int>(type: "int", nullable: false),
                    SoTieuThu = table.Column<int>(type: "int", nullable: false),
                    ThangNam = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NgayGhi = table.Column<DateTime>(type: "datetime2", nullable: false),
                    GhiChu = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChiSoCongTos", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "DayTros",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenDayTro = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DiaChi = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    SoTang = table.Column<int>(type: "int", nullable: false),
                    SoPhongMoiTang = table.Column<int>(type: "int", nullable: false),
                    MoTa = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NgayCapNhat = table.Column<DateTime>(type: "datetime2", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DayTros", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "PhongTros",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SoPhong = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TenPhong = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    DiaChi = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Tang = table.Column<int>(type: "int", nullable: false),
                    GiaThue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TienCoc = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DienTich = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    MoTa = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DayTroId = table.Column<int>(type: "int", nullable: false),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NgayCapNhat = table.Column<DateTime>(type: "datetime2", nullable: true),
                    HinhAnh1 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HinhAnh2 = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    HinhAnh3 = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PhongTros", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PhongTros_DayTros_DayTroId",
                        column: x => x.DayTroId,
                        principalTable: "DayTros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "DichVus",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenDichVu = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    DonViTinh = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    GiaMacDinh = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LoaiGia = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    DayTroId = table.Column<int>(type: "int", nullable: true),
                    PhongTroId = table.Column<int>(type: "int", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NgayCapNhat = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_DichVus", x => x.Id);
                    table.ForeignKey(
                        name: "FK_DichVus_DayTros_DayTroId",
                        column: x => x.DayTroId,
                        principalTable: "DayTros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_DichVus_PhongTros_PhongTroId",
                        column: x => x.PhongTroId,
                        principalTable: "PhongTros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HoaDons",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaHoaDon = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PhongTroId = table.Column<int>(type: "int", nullable: false),
                    ThangNam = table.Column<DateTime>(type: "datetime2", nullable: false),
                    TienPhong = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TienDien = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TienNuoc = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TienInternet = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TienVeSinh = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    CongNoThangTruoc = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TongTien = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    NgayThanhToan = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PhuongThucThanhToan = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: true),
                    MaGiaoDich = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FileHoaDon = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DaGuiEmail = table.Column<bool>(type: "bit", nullable: false),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    GhiChu = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HoaDons", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HoaDons_PhongTros_PhongTroId",
                        column: x => x.PhongTroId,
                        principalTable: "PhongTros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "KhachThues",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    HoTen = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SoDienThoai = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    CCCD = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    NgaySinh = table.Column<DateTime>(type: "datetime2", nullable: false),
                    GioiTinh = table.Column<string>(type: "nvarchar(10)", maxLength: 10, nullable: false),
                    DiaChiThuongTru = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NgayBatDauThue = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NgayKetThucThue = table.Column<DateTime>(type: "datetime2", nullable: true),
                    PhongTroId = table.Column<int>(type: "int", nullable: false),
                    LaKhachChinh = table.Column<bool>(type: "bit", nullable: false),
                    KhachChinhId = table.Column<int>(type: "int", nullable: true),
                    AnhCCCDMatTruoc = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    AnhCCCDMatSau = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_KhachThues", x => x.Id);
                    table.ForeignKey(
                        name: "FK_KhachThues_KhachThues_KhachChinhId",
                        column: x => x.KhachChinhId,
                        principalTable: "KhachThues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_KhachThues_PhongTros_PhongTroId",
                        column: x => x.PhongTroId,
                        principalTable: "PhongTros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "HopDongs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MaHopDong = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PhongTroId = table.Column<int>(type: "int", nullable: false),
                    KhachThueId = table.Column<int>(type: "int", nullable: false),
                    NgayBatDau = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NgayKetThuc = table.Column<DateTime>(type: "datetime2", nullable: false),
                    GiaThue = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TienCoc = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    TrangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    GhiChu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    FileHopDong = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NgayCapNhat = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_HopDongs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_HopDongs_KhachThues_KhachThueId",
                        column: x => x.KhachThueId,
                        principalTable: "KhachThues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_HopDongs_PhongTros_PhongTroId",
                        column: x => x.PhongTroId,
                        principalTable: "PhongTros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "LichSuChuyenPhongs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    KhachThueId = table.Column<int>(type: "int", nullable: false),
                    PhongTroCuId = table.Column<int>(type: "int", nullable: false),
                    PhongTroMoiId = table.Column<int>(type: "int", nullable: false),
                    NgayChuyen = table.Column<DateTime>(type: "datetime2", nullable: false),
                    LyDo = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    GhiChu = table.Column<string>(type: "nvarchar(max)", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_LichSuChuyenPhongs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_LichSuChuyenPhongs_KhachThues_KhachThueId",
                        column: x => x.KhachThueId,
                        principalTable: "KhachThues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "Users",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Username = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Email = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    PasswordHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    HoTen = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    SoDienThoai = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    VaiTro = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NgayCapNhat = table.Column<DateTime>(type: "datetime2", nullable: true),
                    RefreshToken = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    RefreshTokenExpiryTime = table.Column<DateTime>(type: "datetime2", nullable: true),
                    KhachThueId = table.Column<int>(type: "int", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Users", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Users_KhachThues_KhachThueId",
                        column: x => x.KhachThueId,
                        principalTable: "KhachThues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "YeuCauChinhSuas",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    KhachThueId = table.Column<int>(type: "int", nullable: false),
                    PhongTroId = table.Column<int>(type: "int", nullable: false),
                    LoaiYeuCau = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    TieuDe = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NoiDung = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AnhMinhHoa = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    TrangThai = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    PhanHoi = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NgayXuLy = table.Column<DateTime>(type: "datetime2", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_YeuCauChinhSuas", x => x.Id);
                    table.ForeignKey(
                        name: "FK_YeuCauChinhSuas_KhachThues_KhachThueId",
                        column: x => x.KhachThueId,
                        principalTable: "KhachThues",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_YeuCauChinhSuas_PhongTros_PhongTroId",
                        column: x => x.PhongTroId,
                        principalTable: "PhongTros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ThongBaos",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TieuDe = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    NoiDung = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    DayTroId = table.Column<int>(type: "int", nullable: true),
                    PhongTroId = table.Column<int>(type: "int", nullable: true),
                    NgayTao = table.Column<DateTime>(type: "datetime2", nullable: false),
                    NguoiTaoId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ThongBaos", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ThongBaos_DayTros_DayTroId",
                        column: x => x.DayTroId,
                        principalTable: "DayTros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ThongBaos_PhongTros_PhongTroId",
                        column: x => x.PhongTroId,
                        principalTable: "PhongTros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ThongBaos_Users_NguoiTaoId",
                        column: x => x.NguoiTaoId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "ThongBaoDaDocs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ThongBaoId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    NgayDoc = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ThongBaoDaDocs", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ThongBaoDaDocs_ThongBaos_ThongBaoId",
                        column: x => x.ThongBaoId,
                        principalTable: "ThongBaos",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_ThongBaoDaDocs_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChiSoCongToGuiTuThues_KhachThueId",
                table: "ChiSoCongToGuiTuThues",
                column: "KhachThueId");

            migrationBuilder.CreateIndex(
                name: "IX_ChiSoCongToGuiTuThues_PhongTroId",
                table: "ChiSoCongToGuiTuThues",
                column: "PhongTroId");

            migrationBuilder.CreateIndex(
                name: "IX_ChiSoCongTos_PhongTroId",
                table: "ChiSoCongTos",
                column: "PhongTroId");

            migrationBuilder.CreateIndex(
                name: "IX_DayTros_UserId",
                table: "DayTros",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_DichVus_DayTroId",
                table: "DichVus",
                column: "DayTroId");

            migrationBuilder.CreateIndex(
                name: "IX_DichVus_PhongTroId",
                table: "DichVus",
                column: "PhongTroId");

            migrationBuilder.CreateIndex(
                name: "IX_HoaDons_MaHoaDon",
                table: "HoaDons",
                column: "MaHoaDon",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HoaDons_PhongTroId",
                table: "HoaDons",
                column: "PhongTroId");

            migrationBuilder.CreateIndex(
                name: "IX_HopDongs_KhachThueId",
                table: "HopDongs",
                column: "KhachThueId");

            migrationBuilder.CreateIndex(
                name: "IX_HopDongs_MaHopDong",
                table: "HopDongs",
                column: "MaHopDong",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_HopDongs_PhongTroId",
                table: "HopDongs",
                column: "PhongTroId");

            migrationBuilder.CreateIndex(
                name: "IX_KhachThues_KhachChinhId",
                table: "KhachThues",
                column: "KhachChinhId");

            migrationBuilder.CreateIndex(
                name: "IX_KhachThues_PhongTroId",
                table: "KhachThues",
                column: "PhongTroId");

            migrationBuilder.CreateIndex(
                name: "IX_LichSuChuyenPhongs_KhachThueId",
                table: "LichSuChuyenPhongs",
                column: "KhachThueId");

            migrationBuilder.CreateIndex(
                name: "IX_OtpCodes_Email_Code_Purpose",
                table: "OtpCodes",
                columns: new[] { "Email", "Code", "Purpose" });

            migrationBuilder.CreateIndex(
                name: "IX_PhongTros_DayTroId",
                table: "PhongTros",
                column: "DayTroId");

            migrationBuilder.CreateIndex(
                name: "IX_PhongTros_SoPhong",
                table: "PhongTros",
                column: "SoPhong",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ThongBaoDaDocs_ThongBaoId_UserId",
                table: "ThongBaoDaDocs",
                columns: new[] { "ThongBaoId", "UserId" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_ThongBaoDaDocs_UserId",
                table: "ThongBaoDaDocs",
                column: "UserId");

            migrationBuilder.CreateIndex(
                name: "IX_ThongBaos_DayTroId",
                table: "ThongBaos",
                column: "DayTroId");

            migrationBuilder.CreateIndex(
                name: "IX_ThongBaos_NguoiTaoId",
                table: "ThongBaos",
                column: "NguoiTaoId");

            migrationBuilder.CreateIndex(
                name: "IX_ThongBaos_PhongTroId",
                table: "ThongBaos",
                column: "PhongTroId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Email",
                table: "Users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_KhachThueId",
                table: "Users",
                column: "KhachThueId");

            migrationBuilder.CreateIndex(
                name: "IX_Users_Username",
                table: "Users",
                column: "Username",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_YeuCauChinhSuas_KhachThueId",
                table: "YeuCauChinhSuas",
                column: "KhachThueId");

            migrationBuilder.CreateIndex(
                name: "IX_YeuCauChinhSuas_PhongTroId",
                table: "YeuCauChinhSuas",
                column: "PhongTroId");

            migrationBuilder.AddForeignKey(
                name: "FK_ChiSoCongToGuiTuThues_KhachThues_KhachThueId",
                table: "ChiSoCongToGuiTuThues",
                column: "KhachThueId",
                principalTable: "KhachThues",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ChiSoCongToGuiTuThues_PhongTros_PhongTroId",
                table: "ChiSoCongToGuiTuThues",
                column: "PhongTroId",
                principalTable: "PhongTros",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_ChiSoCongTos_PhongTros_PhongTroId",
                table: "ChiSoCongTos",
                column: "PhongTroId",
                principalTable: "PhongTros",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_DayTros_Users_UserId",
                table: "DayTros",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_KhachThues_KhachThueId",
                table: "Users");

            migrationBuilder.DropTable(
                name: "ChiSoCongToGuiTuThues");

            migrationBuilder.DropTable(
                name: "ChiSoCongTos");

            migrationBuilder.DropTable(
                name: "DichVus");

            migrationBuilder.DropTable(
                name: "HoaDons");

            migrationBuilder.DropTable(
                name: "HopDongs");

            migrationBuilder.DropTable(
                name: "LichSuChuyenPhongs");

            migrationBuilder.DropTable(
                name: "OtpCodes");

            migrationBuilder.DropTable(
                name: "ThongBaoDaDocs");

            migrationBuilder.DropTable(
                name: "YeuCauChinhSuas");

            migrationBuilder.DropTable(
                name: "ThongBaos");

            migrationBuilder.DropTable(
                name: "KhachThues");

            migrationBuilder.DropTable(
                name: "PhongTros");

            migrationBuilder.DropTable(
                name: "DayTros");

            migrationBuilder.DropTable(
                name: "Users");
        }
    }
}
