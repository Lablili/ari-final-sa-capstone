using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ari_final_sa_capstone.Migrations
{
    /// <inheritdoc />
    public partial class AddRegistryAnnouncementsAndFeedback : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Announcements",
                columns: table => new
                {
                    AId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ACategory = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ARecepientGroup = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    ALocation = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Adate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AResoNo = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    AeffectiveDate = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Apenalty = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    AAddDetails = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AOfficer = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    AMessage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    AStatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    ACreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ADeliveredCount = table.Column<int>(type: "int", nullable: false),
                    AIsArchived = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Announcements", x => x.AId);
                });

            migrationBuilder.CreateTable(
                name: "FeedbackMessages",
                columns: table => new
                {
                    MId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    MSender = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    MCategory = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Mbarangay = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    McontactNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    MdateReceived = table.Column<DateTime>(type: "datetime2", nullable: false),
                    MtimeReceived = table.Column<TimeSpan>(type: "time", nullable: false),
                    Mstatus = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    Mmessage = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Msubject = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    Mvessel = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FeedbackMessages", x => x.MId);
                });

            migrationBuilder.CreateTable(
                name: "FisherfolkRegistries",
                columns: table => new
                {
                    FrId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Frfname = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Frlname = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    Frmname = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    Frbarangay = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FrvesselName = table.Column<string>(type: "nvarchar(150)", maxLength: 150, nullable: false),
                    FrregCode = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FrcontactNumber = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FrisActive = table.Column<bool>(type: "bit", nullable: false),
                    Fraddress = table.Column<string>(type: "nvarchar(250)", maxLength: 250, nullable: false),
                    Frbirthdate = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Frage = table.Column<int>(type: "int", nullable: false),
                    Frgender = table.Column<string>(type: "nvarchar(50)", maxLength: 50, nullable: false),
                    FrvesselType = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FrboatNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    FrpermitNumber = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: true),
                    FrcaptureMethod = table.Column<string>(type: "nvarchar(200)", maxLength: 200, nullable: false),
                    FrregistrationStatus = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_FisherfolkRegistries", x => x.FrId);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Announcements");

            migrationBuilder.DropTable(
                name: "FeedbackMessages");

            migrationBuilder.DropTable(
                name: "FisherfolkRegistries");
        }
    }
}
