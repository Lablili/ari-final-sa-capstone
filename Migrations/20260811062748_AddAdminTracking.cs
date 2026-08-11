using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ari_final_sa_capstone.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminTracking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ActionedByAdmin",
                table: "FeedbackMessages",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CreatedByAdmin",
                table: "BlotterReports",
                type: "nvarchar(100)",
                maxLength: 100,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActionedByAdmin",
                table: "FeedbackMessages");

            migrationBuilder.DropColumn(
                name: "CreatedByAdmin",
                table: "BlotterReports");
        }
    }
}
