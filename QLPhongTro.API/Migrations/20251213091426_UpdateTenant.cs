using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QLPhongTro.API.Migrations
{
    /// <inheritdoc />
    public partial class UpdateTenant : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Users_KhachThues_KhachThueId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Users_KhachThueId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "KhachThueId",
                table: "Users");

            migrationBuilder.AddColumn<string>(
                name: "TrangThaiCoc",
                table: "KhachThues",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "UserId",
                table: "KhachThues",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_KhachThues_UserId",
                table: "KhachThues",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_KhachThues_Users_UserId",
                table: "KhachThues",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_KhachThues_Users_UserId",
                table: "KhachThues");

            migrationBuilder.DropIndex(
                name: "IX_KhachThues_UserId",
                table: "KhachThues");

            migrationBuilder.DropColumn(
                name: "TrangThaiCoc",
                table: "KhachThues");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "KhachThues");

            migrationBuilder.AddColumn<int>(
                name: "KhachThueId",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Users_KhachThueId",
                table: "Users",
                column: "KhachThueId");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_KhachThues_KhachThueId",
                table: "Users",
                column: "KhachThueId",
                principalTable: "KhachThues",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);
        }
    }
}
