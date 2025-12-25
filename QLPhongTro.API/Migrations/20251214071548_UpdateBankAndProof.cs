using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QLPhongTro.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateBankAndProof : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "SoTaiKhoan",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TenNganHang",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "TenTaiKhoan",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "AnhMinhChung",
                table: "HoaDons",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "SoTaiKhoan",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TenNganHang",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TenTaiKhoan",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AnhMinhChung",
                table: "HoaDons");
        }
    }
}
