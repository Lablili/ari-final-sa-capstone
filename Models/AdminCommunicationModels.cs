using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ari_final_sa_capstone.Models
{
    public class AdminMessage
    {
        [Key]
        public int MessageID { get; set; }

        [Required]
        [MaxLength(450)] // Identity User ID length
        public string SenderAdminID { get; set; } = string.Empty;

        [MaxLength(50)]
        public string SenderRole { get; set; } = string.Empty; // 'BantayDagat', 'FisheriesMAO', 'SuperAdmin'

        [MaxLength(450)]
        public string? ReceiverAdminID { get; set; } // NULL = broadcast to all admins

        [MaxLength(1000)]
        public string MessageContent { get; set; } = string.Empty;

        [MaxLength(20)]
        public string MessageType { get; set; } = "TEXT"; // 'TEXT', 'ALERT', 'COORDINATION'

        public bool IsRead { get; set; } = false;

        public DateTime? ReadTimestamp { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.UtcNow;

        // Navigation Property for Attachments
        public virtual ICollection<AdminMessageAttachment> Attachments { get; set; } = new List<AdminMessageAttachment>();

        // Navigation property to ApplicationUser (assuming ApplicationUser exists in Data layer or Models)
        [ForeignKey("SenderAdminID")]
        public virtual ApplicationUser? Sender { get; set; }
        
        [ForeignKey("ReceiverAdminID")]
        public virtual ApplicationUser? Receiver { get; set; }
    }

    public class AdminMessageAttachment
    {
        [Key]
        public int AttachmentID { get; set; }

        public int MessageID { get; set; }

        [MaxLength(50)]
        public string ResourceType { get; set; } = string.Empty; // 'INCIDENT', 'ANNOUNCEMENT', 'ORDINANCE'

        public int? ResourceID { get; set; } // Reference to incident/announcement ID

        [MaxLength(255)]
        public string ResourceTitle { get; set; } = string.Empty;

        [ForeignKey("MessageID")]
        public virtual AdminMessage? Message { get; set; }
    }

    public class AdminChatArchive
    {
        [Key]
        public int ArchiveID { get; set; }

        public int? MessageID { get; set; }

        [MaxLength(255)]
        public string ConversationTopic { get; set; } = string.Empty;

        public DateTime ArchivedDate { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string ArchiveReason { get; set; } = string.Empty; // 'RESOLVED', 'MANUAL', 'AUTO_30DAYS'
    }
}
