using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ari_final_sa_capstone.Models
{
    public class FisherfolkRegistry
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.Identity)]
        public int FrId { get; set; }

        [Required]
        [MaxLength(100)]
        public string Frfname { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string Frlname { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? Frmname { get; set; }

        [Required]
        [MaxLength(100)]
        public string Frbarangay { get; set; } = string.Empty;

        [Required]
        [MaxLength(150)]
        public string FrvesselName { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FrregCode { get; set; } = string.Empty;

        [Required]
        [MaxLength(50)]
        public string FrcontactNumber { get; set; } = string.Empty;

        public bool FrisActive { get; set; }

        // System Required Fields
        [Required]
        [MaxLength(250)]
        public string Fraddress { get; set; } = string.Empty;

        [Required]
        public DateTime Frbirthdate { get; set; } = DateTime.MinValue;

        public int Frage { get; set; }

        [Required]
        [MaxLength(50)]
        public string Frgender { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FrvesselType { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FrboatNumber { get; set; } = string.Empty;

        [MaxLength(100)]
        public string? FrpermitNumber { get; set; }

        [Required]
        [MaxLength(200)]
        public string FrcaptureMethod { get; set; } = string.Empty;

        [Required]
        [MaxLength(100)]
        public string FrregistrationStatus { get; set; } = "Active";
    }
}
