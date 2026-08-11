using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ari_final_sa_capstone.Migrations
{
    /// <inheritdoc />
    public partial class AddGroupIdToFeedbackMessage : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "GroupId",
                table: "FeedbackMessages",
                type: "int",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "GroupId",
                table: "FeedbackMessages");
        }
    }
}
