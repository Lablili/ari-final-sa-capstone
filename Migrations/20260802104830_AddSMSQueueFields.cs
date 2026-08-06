using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ari_final_sa_capstone.Migrations
{
    /// <inheritdoc />
    public partial class AddSMSQueueFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "DeliveryStatus",
                table: "SMSLogs",
                newName: "Status");

            migrationBuilder.AddColumn<int>(
                name: "AnnouncementId",
                table: "SMSLogs",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "RetryCount",
                table: "SMSLogs",
                type: "int",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AnnouncementId",
                table: "SMSLogs");

            migrationBuilder.DropColumn(
                name: "RetryCount",
                table: "SMSLogs");

            migrationBuilder.RenameColumn(
                name: "Status",
                table: "SMSLogs",
                newName: "DeliveryStatus");
        }
    }
}
