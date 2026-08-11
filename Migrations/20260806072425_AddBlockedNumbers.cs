using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ari_final_sa_capstone.Migrations
{
    /// <inheritdoc />
    public partial class AddBlockedNumbers : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "BlockedNumbers",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    PhoneNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Reason = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    BlockedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    BlockedUntil = table.Column<DateTime>(type: "datetime2", nullable: true),
                    BlockedBy = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_BlockedNumbers", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BlockedNumbers");
        }
    }
}
