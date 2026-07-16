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

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder); // required — this builds all the Identity tables (AspNetUsers, AspNetRoles, etc.)

            // Your custom tables (Violations, PatrolReports, FisherfolkRecords, etc.)
            // will go here later as DbSet<T> properties + any relationship config.
        }
    }
}
