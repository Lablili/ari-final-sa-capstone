using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ari_final_sa_capstone.Models
{
    public class Announcement
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int AId { get; set; }

        [Required]
        [MaxLength(100)]
        public string ACategory { get; set; } = string.Empty;

        [MaxLength(200)]
        public string ATitle { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string ARecepientGroup { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string ALocation { get; set; } = string.Empty;

        [Required]
        public DateTime Adate { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string AResoNo { get; set; } = string.Empty;

        [MaxLength(100)]
        public string AeffectiveDate { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Apenalty { get; set; } = string.Empty;

        public string AAddDetails { get; set; } = string.Empty;

        [MaxLength(500)]
        public string AAttachmentPath { get; set; } = string.Empty;

        [MaxLength(150)]
        public string AContactPerson { get; set; } = string.Empty;

        public DateTime? AEventDate { get; set; }

        // System Required Fields
        [Required]
        [MaxLength(150)]
        public string AOfficer { get; set; } = string.Empty;

        [Required]
        public string AMessage { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string AStatus { get; set; } = "Delivered";

        [Required]
        public DateTime ACreatedAt { get; set; } = DateTime.UtcNow;

        public int ADeliveredCount { get; set; }

        public bool AIsArchived { get; set; }
    }
}
