using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ari_final_sa_capstone.Models
{
    public class FisherfolkRegistry
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string Fname { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Lname { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Mname { get; set; }

        [Required]
        [MaxLength(100)]
        public string Barangay { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string VesselName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string RegCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string ContactNumber { get; set; } = string.Empty;

        public bool IsActive { get; set; }

        // System Required Fields
        [Required]
        [MaxLength(250)]
        public string Address { get; set; } = string.Empty;

        [Required]
        public DateTime Birthdate { get; set; } = DateTime.MinValue;

        public int Age { get; set; }

        [Required]
        [MaxLength(50)]
        public string Gender { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string VesselType { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string BoatNumber { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? PermitNumber { get; set; }

        [Required]
        [MaxLength(200)]
        public string CaptureMethod { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string RegistrationStatus { get; set; } = "Active";
    }
}
