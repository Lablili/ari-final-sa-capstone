using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ari_final_sa_capstone.Models
{
    public class BlockedNumber
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        public string PhoneNumber { get; set; } = string.Empty;

        [MaxLength(500)]
        public string Reason { get; set; } = string.Empty;

        [Required]
        public DateTime BlockedAt { get; set; } = DateTime.UtcNow;

        public DateTime? BlockedUntil { get; set; }

        [MaxLength(100)]
        public string BlockedBy { get; set; } = string.Empty;
    }
}
