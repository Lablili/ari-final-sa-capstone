using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace ari_final_sa_capstone.Models
{
    public class AdminUserDisplayViewModel
    {
        public string Id { get; set; } = string.Empty;
        public string FullName { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public bool IsActive { get; set; }
        public DateTime DateCreated { get; set; }
    }

    public class CreateAdminViewModel
    {
        [Required(ErrorMessage = "Full Name is required.")]
        [Display(Name = "Full Name")]
        public string FullName { get; set; } = string.Empty;

        [Required(ErrorMessage = "Email Address is required.")]
        [EmailAddress(ErrorMessage = "Invalid Email Address.")]
        public string Email { get; set; } = string.Empty;

        [Required(ErrorMessage = "Password is required.")]
        [MinLength(6, ErrorMessage = "Password must be at least 6 characters.")]
        public string Password { get; set; } = string.Empty;

        [Required(ErrorMessage = "A role must be assigned.")]
        public string Role { get; set; } = string.Empty;
    }

    public class DbTableMetric
    {
        public string TableName { get; set; } = string.Empty;
        public int RowCount { get; set; }
    }

    public class SystemDiagnosticsViewModel
    {
        public bool DbConnectionOk { get; set; }
        public string ConnectionString { get; set; } = string.Empty;
        public string DatabaseName { get; set; } = string.Empty;
        public List<DbTableMetric> Tables { get; set; } = new List<DbTableMetric>();

        // GSM Hardware diagnostics
        public string GsmSignalStrength { get; set; } = "Good (-75 dBm)";
        public string GsmPort { get; set; } = "COM3 (USB Serial)";
        public string GsmStatus { get; set; } = "Online / Ready";
        public int PendingSmsCount { get; set; } = 0;
        public int TotalSmsSent { get; set; } = 412;
    }

    public class SuperAdminDashboardViewModel
    {
        public List<AdminUserDisplayViewModel> Admins { get; set; } = new List<AdminUserDisplayViewModel>();
        public CreateAdminViewModel NewAdmin { get; set; } = new CreateAdminViewModel();
        public SystemDiagnosticsViewModel Diagnostics { get; set; } = new SystemDiagnosticsViewModel();
    }
}
