using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace ari_final_sa_capstone.Migrations
{
    public partial class RemoveModelPrefixes : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // FisherfolkRegistry
            migrationBuilder.RenameColumn(name: "FrId", table: "FisherfolkRegistries", newName: "Id");
            migrationBuilder.RenameColumn(name: "Frfname", table: "FisherfolkRegistries", newName: "Fname");
            migrationBuilder.RenameColumn(name: "Frlname", table: "FisherfolkRegistries", newName: "Lname");
            migrationBuilder.RenameColumn(name: "Frmname", table: "FisherfolkRegistries", newName: "Mname");
            migrationBuilder.RenameColumn(name: "Frbarangay", table: "FisherfolkRegistries", newName: "Barangay");
            migrationBuilder.RenameColumn(name: "FrvesselName", table: "FisherfolkRegistries", newName: "VesselName");
            migrationBuilder.RenameColumn(name: "FrregCode", table: "FisherfolkRegistries", newName: "RegCode");
            migrationBuilder.RenameColumn(name: "FrcontactNumber", table: "FisherfolkRegistries", newName: "ContactNumber");
            migrationBuilder.RenameColumn(name: "FrisActive", table: "FisherfolkRegistries", newName: "IsActive");
            migrationBuilder.RenameColumn(name: "Fraddress", table: "FisherfolkRegistries", newName: "Address");
            migrationBuilder.RenameColumn(name: "Frbirthdate", table: "FisherfolkRegistries", newName: "Birthdate");
            migrationBuilder.RenameColumn(name: "Frage", table: "FisherfolkRegistries", newName: "Age");
            migrationBuilder.RenameColumn(name: "Frgender", table: "FisherfolkRegistries", newName: "Gender");
            migrationBuilder.RenameColumn(name: "FrvesselType", table: "FisherfolkRegistries", newName: "VesselType");
            migrationBuilder.RenameColumn(name: "FrboatNumber", table: "FisherfolkRegistries", newName: "BoatNumber");
            migrationBuilder.RenameColumn(name: "FrpermitNumber", table: "FisherfolkRegistries", newName: "PermitNumber");
            migrationBuilder.RenameColumn(name: "FrcaptureMethod", table: "FisherfolkRegistries", newName: "CaptureMethod");
            migrationBuilder.RenameColumn(name: "FrregistrationStatus", table: "FisherfolkRegistries", newName: "RegistrationStatus");

            // FeedbackMessage
            migrationBuilder.RenameColumn(name: "MId", table: "FeedbackMessages", newName: "Id");
            migrationBuilder.RenameColumn(name: "MSender", table: "FeedbackMessages", newName: "Sender");
            migrationBuilder.RenameColumn(name: "MCategory", table: "FeedbackMessages", newName: "Category");
            migrationBuilder.RenameColumn(name: "MFlaggedPlace", table: "FeedbackMessages", newName: "FlaggedPlace");
            migrationBuilder.RenameColumn(name: "McontactNumber", table: "FeedbackMessages", newName: "ContactNumber");
            migrationBuilder.RenameColumn(name: "MdateReceived", table: "FeedbackMessages", newName: "DateReceived");
            migrationBuilder.RenameColumn(name: "MtimeReceived", table: "FeedbackMessages", newName: "TimeReceived");
            migrationBuilder.RenameColumn(name: "Mstatus", table: "FeedbackMessages", newName: "Status");
            migrationBuilder.RenameColumn(name: "MPriorityLevel", table: "FeedbackMessages", newName: "PriorityLevel");
            migrationBuilder.RenameColumn(name: "Mmessage", table: "FeedbackMessages", newName: "Message");
            migrationBuilder.RenameColumn(name: "Msubject", table: "FeedbackMessages", newName: "Subject");

            // Announcement
            migrationBuilder.RenameColumn(name: "AId", table: "Announcements", newName: "Id");
            migrationBuilder.RenameColumn(name: "ACategory", table: "Announcements", newName: "Category");
            migrationBuilder.RenameColumn(name: "ATitle", table: "Announcements", newName: "Title");
            migrationBuilder.RenameColumn(name: "ARecepientGroup", table: "Announcements", newName: "RecepientGroup");
            migrationBuilder.RenameColumn(name: "ALocation", table: "Announcements", newName: "Location");
            migrationBuilder.RenameColumn(name: "Adate", table: "Announcements", newName: "Date");
            migrationBuilder.RenameColumn(name: "AResoNo", table: "Announcements", newName: "ResoNo");
            migrationBuilder.RenameColumn(name: "AeffectiveDate", table: "Announcements", newName: "EffectiveDate");
            migrationBuilder.RenameColumn(name: "Apenalty", table: "Announcements", newName: "Penalty");
            migrationBuilder.RenameColumn(name: "AAddDetails", table: "Announcements", newName: "AddDetails");
            migrationBuilder.RenameColumn(name: "AAttachmentPath", table: "Announcements", newName: "AttachmentPath");
            migrationBuilder.RenameColumn(name: "AContactPerson", table: "Announcements", newName: "ContactPerson");
            migrationBuilder.RenameColumn(name: "AEventDate", table: "Announcements", newName: "EventDate");
            migrationBuilder.RenameColumn(name: "AOfficer", table: "Announcements", newName: "Officer");
            migrationBuilder.RenameColumn(name: "AMessage", table: "Announcements", newName: "Message");
            migrationBuilder.RenameColumn(name: "AStatus", table: "Announcements", newName: "Status");
            migrationBuilder.RenameColumn(name: "ACreatedAt", table: "Announcements", newName: "CreatedAt");
            migrationBuilder.RenameColumn(name: "ADeliveredCount", table: "Announcements", newName: "DeliveredCount");
            migrationBuilder.RenameColumn(name: "AIsArchived", table: "Announcements", newName: "IsArchived");
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // FisherfolkRegistry
            migrationBuilder.RenameColumn(name: "Id", table: "FisherfolkRegistries", newName: "FrId");
            migrationBuilder.RenameColumn(name: "Fname", table: "FisherfolkRegistries", newName: "Frfname");
            migrationBuilder.RenameColumn(name: "Lname", table: "FisherfolkRegistries", newName: "Frlname");
            migrationBuilder.RenameColumn(name: "Mname", table: "FisherfolkRegistries", newName: "Frmname");
            migrationBuilder.RenameColumn(name: "Barangay", table: "FisherfolkRegistries", newName: "Frbarangay");
            migrationBuilder.RenameColumn(name: "VesselName", table: "FisherfolkRegistries", newName: "FrvesselName");
            migrationBuilder.RenameColumn(name: "RegCode", table: "FisherfolkRegistries", newName: "FrregCode");
            migrationBuilder.RenameColumn(name: "ContactNumber", table: "FisherfolkRegistries", newName: "FrcontactNumber");
            migrationBuilder.RenameColumn(name: "IsActive", table: "FisherfolkRegistries", newName: "FrisActive");
            migrationBuilder.RenameColumn(name: "Address", table: "FisherfolkRegistries", newName: "Fraddress");
            migrationBuilder.RenameColumn(name: "Birthdate", table: "FisherfolkRegistries", newName: "Frbirthdate");
            migrationBuilder.RenameColumn(name: "Age", table: "FisherfolkRegistries", newName: "Frage");
            migrationBuilder.RenameColumn(name: "Gender", table: "FisherfolkRegistries", newName: "Frgender");
            migrationBuilder.RenameColumn(name: "VesselType", table: "FisherfolkRegistries", newName: "FrvesselType");
            migrationBuilder.RenameColumn(name: "BoatNumber", table: "FisherfolkRegistries", newName: "FrboatNumber");
            migrationBuilder.RenameColumn(name: "PermitNumber", table: "FisherfolkRegistries", newName: "FrpermitNumber");
            migrationBuilder.RenameColumn(name: "CaptureMethod", table: "FisherfolkRegistries", newName: "FrcaptureMethod");
            migrationBuilder.RenameColumn(name: "RegistrationStatus", table: "FisherfolkRegistries", newName: "FrregistrationStatus");

            // FeedbackMessage
            migrationBuilder.RenameColumn(name: "Id", table: "FeedbackMessages", newName: "MId");
            migrationBuilder.RenameColumn(name: "Sender", table: "FeedbackMessages", newName: "MSender");
            migrationBuilder.RenameColumn(name: "Category", table: "FeedbackMessages", newName: "MCategory");
            migrationBuilder.RenameColumn(name: "FlaggedPlace", table: "FeedbackMessages", newName: "MFlaggedPlace");
            migrationBuilder.RenameColumn(name: "ContactNumber", table: "FeedbackMessages", newName: "McontactNumber");
            migrationBuilder.RenameColumn(name: "DateReceived", table: "FeedbackMessages", newName: "MdateReceived");
            migrationBuilder.RenameColumn(name: "TimeReceived", table: "FeedbackMessages", newName: "MtimeReceived");
            migrationBuilder.RenameColumn(name: "Status", table: "FeedbackMessages", newName: "Mstatus");
            migrationBuilder.RenameColumn(name: "PriorityLevel", table: "FeedbackMessages", newName: "MPriorityLevel");
            migrationBuilder.RenameColumn(name: "Message", table: "FeedbackMessages", newName: "Mmessage");
            migrationBuilder.RenameColumn(name: "Subject", table: "FeedbackMessages", newName: "Msubject");

            // Announcement
            migrationBuilder.RenameColumn(name: "Id", table: "Announcements", newName: "AId");
            migrationBuilder.RenameColumn(name: "Category", table: "Announcements", newName: "ACategory");
            migrationBuilder.RenameColumn(name: "Title", table: "Announcements", newName: "ATitle");
            migrationBuilder.RenameColumn(name: "RecepientGroup", table: "Announcements", newName: "ARecepientGroup");
            migrationBuilder.RenameColumn(name: "Location", table: "Announcements", newName: "ALocation");
            migrationBuilder.RenameColumn(name: "Date", table: "Announcements", newName: "Adate");
            migrationBuilder.RenameColumn(name: "ResoNo", table: "Announcements", newName: "AResoNo");
            migrationBuilder.RenameColumn(name: "EffectiveDate", table: "Announcements", newName: "AeffectiveDate");
            migrationBuilder.RenameColumn(name: "Penalty", table: "Announcements", newName: "Apenalty");
            migrationBuilder.RenameColumn(name: "AddDetails", table: "Announcements", newName: "AAddDetails");
            migrationBuilder.RenameColumn(name: "AttachmentPath", table: "Announcements", newName: "AAttachmentPath");
            migrationBuilder.RenameColumn(name: "ContactPerson", table: "Announcements", newName: "AContactPerson");
            migrationBuilder.RenameColumn(name: "EventDate", table: "Announcements", newName: "AEventDate");
            migrationBuilder.RenameColumn(name: "Officer", table: "Announcements", newName: "AOfficer");
            migrationBuilder.RenameColumn(name: "Message", table: "Announcements", newName: "AMessage");
            migrationBuilder.RenameColumn(name: "Status", table: "Announcements", newName: "AStatus");
            migrationBuilder.RenameColumn(name: "CreatedAt", table: "Announcements", newName: "ACreatedAt");
            migrationBuilder.RenameColumn(name: "DeliveredCount", table: "Announcements", newName: "ADeliveredCount");
            migrationBuilder.RenameColumn(name: "IsArchived", table: "Announcements", newName: "AIsArchived");
        }
    }
}
