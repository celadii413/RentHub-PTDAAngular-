using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QLPhongTro.API.Migrations
{
    /// <inheritdoc />
    public partial class AddGioiHanSoNguoiToPhongTro : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "GioiHanSoNguoi",
                table: "PhongTros",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GioiHanSoNguoi",
                table: "PhongTros");
        }
    }
}
