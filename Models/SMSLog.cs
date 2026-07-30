using System;
using System.ComponentModel.DataAnnotations;

namespace ari_final_sa_capstone.Models
{
    public class SMSLog
    {
        [Key]
        public int SmsId { get; set; }

        [Required]
        public DateTime TimestampSent { get; set; } = DateTime.Now;

        public DateTime? TimestampReceived { get; set; }

        [Required]
        [MaxLength(50)]
        public string DeliveryStatus { get; set; } = "Pending"; // E.g., Delivered, Failed, Pending

        [Required]
        [MaxLength(50)]
        public string MessageType { get; set; } = string.Empty; // E.g., Announcement, SOS, Survey

        // Nullable because it might be sent to someone not in registry, or an unregistered number
        public int? FisherfolkId { get; set; } 
        
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;
    }
}
