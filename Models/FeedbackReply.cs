using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ari_final_sa_capstone.Models
{
    [Table("FeedbackReplies")]
    public class FeedbackReply
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        public int FeedbackId { get; set; }

        [Required]
        [MaxLength(50)]
        public string RecipientContact { get; set; } = string.Empty;

        [Required]
        public string ReplyMessage { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? SentByAdmin { get; set; }

        public DateTime SentAt { get; set; } = DateTime.Now;

        [MaxLength(50)]
        public string Status { get; set; } = "DELIVERED";
    }
}
