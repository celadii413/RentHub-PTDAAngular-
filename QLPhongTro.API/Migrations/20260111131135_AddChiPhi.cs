using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace QLPhongTro.API.Migrations
{
    /// <inheritdoc />
    public partial class AddChiPhi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ChiPhis",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    TenChiPhi = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    SoTien = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    LoaiChiPhi = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    NgayChi = table.Column<DateTime>(type: "datetime2", nullable: false),
                    GhiChu = table.Column<string>(type: "nvarchar(max)", nullable: true),
                    DayTroId = table.Column<int>(type: "int", nullable: true),
                    UserId = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ChiPhis", x => x.Id);
                    table.ForeignKey(
                        name: "FK_ChiPhis_DayTros_DayTroId",
                        column: x => x.DayTroId,
                        principalTable: "DayTros",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.SetNull);
                    table.ForeignKey(
                        name: "FK_ChiPhis_Users_UserId",
                        column: x => x.UserId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_ChiPhis_DayTroId",
                table: "ChiPhis",
                column: "DayTroId");

            migrationBuilder.CreateIndex(
                name: "IX_ChiPhis_UserId",
                table: "ChiPhis",
                column: "UserId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ChiPhis");
        }
    }
}
