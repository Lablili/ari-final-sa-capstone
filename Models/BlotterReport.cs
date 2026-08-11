using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ari_final_sa_capstone.Models
{
    public class BlotterReport
    {
        [Key]
        public int IncidentId { get; set; }

        [Required]
        public DateTime IncidentDate { get; set; } = DateTime.Now;

        [Required]
        [MaxLength(100)]
        public string IncidentType { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Location { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string ReportSource { get; set; } = string.Empty;

        [Required]
        public string ActionsTaken { get; set; } = string.Empty;

        // In minutes. Could be calculated based on SMSLog received vs Blotter Report creation.
        public double ResponseTimeMinutes { get; set; }

        [MaxLength(100)]
        public string Outcome { get; set; } = "Pending";
        
        [MaxLength(50)]
        public string Status { get; set; } = "Open";

        // Foreign Key to the related SMS Report (optional, if created directly by Admin)
        public int? RelatedReportSubmissionId { get; set; }

        [MaxLength(100)]
        public string? CreatedByAdmin { get; set; }
    }
}
