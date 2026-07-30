using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using ari_final_sa_capstone.Models;

namespace ari_final_sa_capstone.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
        {
        }

        public DbSet<Announcement> Announcements { get; set; }
        public DbSet<FisherfolkRegistry> FisherfolkRegistries { get; set; }
        public DbSet<FeedbackMessage> FeedbackMessages { get; set; }
        public DbSet<BlotterReport> BlotterReports { get; set; }
        public DbSet<SMSLog> SMSLogs { get; set; }
        public DbSet<ReportSubmission> ReportSubmissions { get; set; }
        public DbSet<SurveyResponse> SurveyResponses { get; set; }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder); // required — this builds all the Identity tables (AspNetUsers, AspNetRoles, etc.)
        }
    }
}
