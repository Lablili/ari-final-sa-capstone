using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ari_final_sa_capstone.Migrations
{
    /// <inheritdoc />
    public partial class UpdateFeedbackMessageAI : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Mvessel",
                table: "FeedbackMessages");

            migrationBuilder.RenameColumn(
                name: "Mbarangay",
                table: "FeedbackMessages",
                newName: "MFlaggedPlace");

            migrationBuilder.AddColumn<string>(
                name: "MPriorityLevel",
                table: "FeedbackMessages",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MPriorityLevel",
                table: "FeedbackMessages");

            migrationBuilder.RenameColumn(
                name: "MFlaggedPlace",
                table: "FeedbackMessages",
                newName: "Mbarangay");

            migrationBuilder.AddColumn<string>(
                name: "Mvessel",
                table: "FeedbackMessages",
                type: "nvarchar(150)",
                maxLength: 150,
                nullable: true);
        }
    }
}
