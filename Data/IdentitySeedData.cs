using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Threading.Tasks;
using ari_final_sa_capstone.Models;

namespace ari_final_sa_capstone.Data
{
    public static class IdentitySeedData
    {
        public static async Task SeedRolesAndAdminAsync(IServiceProvider serviceProvider)
        {
            using var scope = serviceProvider.CreateScope();
            var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();
            var userManager = scope.ServiceProvider.GetRequiredService<UserManager<ApplicationUser>>();

            // Ensure all three roles exist.
            string[] roles = { "SuperAdmin", "BantayDagatAdmin", "FisheriesAdmin" };
            foreach (var role in roles)
            {
                if (!await roleManager.RoleExistsAsync(role))
                    await roleManager.CreateAsync(new IdentityRole(role));
            }

            // Create default SuperAdmin
            var superEmail = "super@admin.com";
            var super = await userManager.FindByEmailAsync(superEmail);
            if (super == null)
            {
                super = new ApplicationUser
                {
                    UserName = superEmail,
                    Email = superEmail,
                    EmailConfirmed = true,
                    FullName = "Super Admin",
                    IsActive = true,
                    DateCreated = DateTime.Now
                };
                var result = await userManager.CreateAsync(super, "Sup3rAdm1n!2026");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(super, "SuperAdmin");
                }
            }

            // Create default BantayDagatAdmin
            var bantayEmail = "bantay@admin.com";
            var bantay = await userManager.FindByEmailAsync(bantayEmail);
            if (bantay == null)
            {
                bantay = new ApplicationUser
                {
                    UserName = bantayEmail,
                    Email = bantayEmail,
                    EmailConfirmed = true,
                    FullName = "Bantay Dagat Admin",
                    IsActive = true,
                    DateCreated = DateTime.Now
                };
                var result = await userManager.CreateAsync(bantay, "Bantay@Adm2026!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(bantay, "BantayDagatAdmin");
                }
            }

            // Create default FisheriesAdmin
            var fisherfolkEmail = "fisheries@admin.com";
            var fisherfolk = await userManager.FindByEmailAsync(fisherfolkEmail);
            if (fisherfolk == null)
            {
                fisherfolk = new ApplicationUser
                {
                    UserName = fisherfolkEmail,
                    Email = fisherfolkEmail,
                    EmailConfirmed = true,
                    FullName = "Fisheries Admin",
                    IsActive = true,
                    DateCreated = DateTime.Now
                };
                var result = await userManager.CreateAsync(fisherfolk, "Fisher@Adm2026!");
                if (result.Succeeded)
                {
                    await userManager.AddToRoleAsync(fisherfolk, "FisheriesAdmin");
                }
            }
        }
    }
}
 