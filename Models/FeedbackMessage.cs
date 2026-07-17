using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ari_final_sa_capstone.Models
{
    public class FeedbackMessage
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int MId { get; set; }

        [Required]
        [MaxLength(150)]
        public string MSender { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string MCategory { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Mbarangay { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string McontactNumber { get; set; } = string.Empty;

        [Required]
        public DateTime MdateReceived { get; set; } = DateTime.UtcNow;

        [Required]
        public TimeSpan MtimeReceived { get; set; } = TimeSpan.Zero;

        [Required]
        [MaxLength(50)]
        public string Mstatus { get; set; } = "new";

        [Required]
        public string Mmessage { get; set; } = string.Empty;

        // System Required Fields
        [Required]
        [MaxLength(200)]
        public string Msubject { get; set; } = string.Empty;

        [MaxLength(150)]
        public string? Mvessel { get; set; }
    }
}
