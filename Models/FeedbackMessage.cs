using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ari_final_sa_capstone.Models
{
    public class FeedbackMessage
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(150)]
        public string Sender { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Category { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FlaggedPlace { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string ContactNumber { get; set; } = string.Empty;

        [Required]
        public DateTime DateReceived { get; set; } = DateTime.UtcNow;

        [Required]
        public TimeSpan TimeReceived { get; set; } = TimeSpan.Zero;

        [Required]
        [MaxLength(50)]
        public string Status { get; set; } = "new";

        [Required]
        [MaxLength(50)]
        public string PriorityLevel { get; set; } = "Low";

        [Required]
        public string Message { get; set; } = string.Empty;

        // System Required Fields
        [Required]
        [MaxLength(200)]
        public string Subject { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? ActionedByAdmin { get; set; }

        public int? GroupId { get; set; }
    }
}
