using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ari_final_sa_capstone.Models
{
    public class Announcement
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Category { get; set; } = string.Empty;

        [MaxLength(200)]
        public string Title { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string RecepientGroup { get; set; } = string.Empty;

        [Required]
        [MaxLength(200)]
        public string Location { get; set; } = string.Empty;

        [Required]
        public DateTime Date { get; set; } = DateTime.UtcNow;

        [MaxLength(100)]
        public string ResoNo { get; set; } = string.Empty;

        [MaxLength(100)]
        public string EffectiveDate { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Penalty { get; set; } = string.Empty;

        public string AddDetails { get; set; } = string.Empty;

        [MaxLength(500)]
        public string AttachmentPath { get; set; } = string.Empty;

        [MaxLength(150)]
        public string ContactPerson { get; set; } = string.Empty;

        public DateTime? EventDate { get; set; }

        // System Required Fields
        [Required]
        [MaxLength(150)]
        public string Officer { get; set; } = string.Empty;

        [Required]
        public string Message { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "Delivered";

        [Required]
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public int DeliveredCount { get; set; }

        public bool IsArchived { get; set; }
    }
}
