using System;
using System.ComponentModel.DataAnnotations;

namespace ari_final_sa_capstone.Models
{
    public class SurveyResponse
    {
        [Key]
        public int SurveyId { get; set; }

        public int? FisherfolkId { get; set; }
        
        [MaxLength(20)]
        public string PhoneNumber { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string Question { get; set; } = string.Empty;

        [Required]
        [MaxLength(500)]
        public string ResponseValue { get; set; } = string.Empty;

        [Required]
        public DateTime Timestamp { get; set; } = DateTime.Now;
    }
}
