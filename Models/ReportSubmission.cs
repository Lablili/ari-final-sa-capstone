using System;
using System.ComponentModel.DataAnnotations;

namespace ari_final_sa_capstone.Models
{
    public class ReportSubmission
    {
        [Key]
        public int ReportId { get; set; }

        [Required]
        public DateTime TimestampSubmitted { get; set; } = DateTime.Now;

        [Required]
        [MaxLength(50)]
        public string ReportType { get; set; } = string.Empty; // E.g., SOS, Incident, Complaint

        public int? FisherfolkId { get; set; }
        
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        public string MessageContent { get; set; } = string.Empty;

        // The Admin who handled it
        [MaxLength(450)] // IdentityUser ID length
        public string? HandledByAdminId { get; set; }

        public DateTime? ResponseTimestamp { get; set; }
        
        [MaxLength(50)]
        public string Status { get; set; } = "Pending"; // Pending, Responded, Ignored
    }
}
