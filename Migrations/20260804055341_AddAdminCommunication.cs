using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ari_final_sa_capstone.Migrations
{
    /// <inheritdoc />
    public partial class AddAdminCommunication : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "AdminChatArchives",
                columns: table => new
                {
                    ArchiveID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MessageID = table.Column<int>(type: "int", nullable: true),
                    ConversationTopic = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    ArchivedDate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ArchiveReason = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminChatArchives", x => x.ArchiveID);
                });

            migrationBuilder.CreateTable(
                name: "AdminMessages",
                columns: table => new
                {
                    MessageID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    SenderAdminID = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: false),
                    SenderRole = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ReceiverAdminID = table.Column<string>(type: "nvarchar(450)", maxLength: 450, nullable: true),
                    MessageContent = table.Column<string>(type: "nvarchar(1000)", maxLength: 1000, nullable: false),
                    MessageType = table.Column<string>(type: "nvarchar(20)", maxLength: 20, nullable: false),
                    IsRead = table.Column<bool>(type: "bit", nullable: false),
                    ReadTimestamp = table.Column<DateTime>(type: "datetime2", nullable: true),
                    Timestamp = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminMessages", x => x.MessageID);
                    table.ForeignKey(
                        name: "FK_AdminMessages_AspNetUsers_ReceiverAdminID",
                        column: x => x.ReceiverAdminID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id");
                    table.ForeignKey(
                        name: "FK_AdminMessages_AspNetUsers_SenderAdminID",
                        column: x => x.SenderAdminID,
                        principalTable: "AspNetUsers",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "AdminMessageAttachments",
                columns: table => new
                {
                    AttachmentID = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MessageID = table.Column<int>(type: "int", nullable: false),
                    ResourceType = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ResourceID = table.Column<int>(type: "int", nullable: true),
                    ResourceTitle = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_AdminMessageAttachments", x => x.AttachmentID);
                    table.ForeignKey(
                        name: "FK_AdminMessageAttachments_AdminMessages_MessageID",
                        column: x => x.MessageID,
                        principalTable: "AdminMessages",
                        principalColumn: "MessageID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_AdminMessageAttachments_MessageID",
                table: "AdminMessageAttachments",
                column: "MessageID");

            migrationBuilder.CreateIndex(
                name: "IX_AdminMessages_ReceiverAdminID",
                table: "AdminMessages",
                column: "ReceiverAdminID");

            migrationBuilder.CreateIndex(
                name: "IX_AdminMessages_SenderAdminID",
                table: "AdminMessages",
                column: "SenderAdminID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "AdminChatArchives");

            migrationBuilder.DropTable(
                name: "AdminMessageAttachments");

            migrationBuilder.DropTable(
                name: "AdminMessages");
        }
    }
}
