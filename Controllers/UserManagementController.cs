using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using ari_final_sa_capstone.Data;
using ari_final_sa_capstone.Models;

namespace ari_final_sa_capstone.Controllers
{
    [Authorize(Roles = "SuperAdmin")]
    public class UserManagementController : Controller
    {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly ApplicationDbContext _db;

        public UserManagementController(
            UserManager<ApplicationUser> userManager,
            RoleManager<IdentityRole> roleManager,
            ApplicationDbContext db)
        {
            _userManager = userManager;
            _roleManager = roleManager;
            _db = db;
        }

        [HttpGet]
        public async Task<IActionResult> Index()
        {
            // Sync Session just in case (to keep consistency across pages)
            var sessionUser = HttpContext.Session.GetString("UserName");
            var sessionRole = HttpContext.Session.GetString("UserRole");
            if (string.IsNullOrEmpty(sessionRole))
            {
                var currentUser = await _userManager.GetUserAsync(User);
                if (currentUser != null)
                {
                    var roles = await _userManager.GetRolesAsync(currentUser);
                    HttpContext.Session.SetString("UserRole", roles.FirstOrDefault() ?? "");
                    HttpContext.Session.SetString("UserName", currentUser.FullName ?? currentUser.Email ?? "");
                }
            }

            var viewModel = new SuperAdminDashboardViewModel();

            // 1. Fetch Admin list and roles
            var users = await _userManager.Users.ToListAsync();
            foreach (var user in users)
            {
                var roles = await _userManager.GetRolesAsync(user);
                var role = roles.FirstOrDefault() ?? "No Role";

                // Only show admins (SuperAdmin, BantayDagatAdmin, FisheriesAdmin)
                if (role == "SuperAdmin" || role == "BantayDagatAdmin" || role == "FisheriesAdmin")
                {
                    viewModel.Admins.Add(new AdminUserDisplayViewModel
                    {
                        Id = user.Id,
                        FullName = user.FullName,
                        Email = user.Email ?? string.Empty,
                        Role = role,
                        IsActive = user.IsActive,
                        DateCreated = user.DateCreated
                    });
                }
            }

            // 2. Fetch system diagnostics & table row counts
            viewModel.Diagnostics.DbConnectionOk = await _db.Database.CanConnectAsync();
            viewModel.Diagnostics.ConnectionString = _db.Database.GetDbConnection().ConnectionString;
            viewModel.Diagnostics.DatabaseName = _db.Database.GetDbConnection().Database;

            // Attempt to retrieve all database tables and row counts dynamically via SQL Server system tables
            var tables = new List<DbTableMetric>();
            try
            {
                var conn = _db.Database.GetDbConnection();
                if (conn.State != System.Data.ConnectionState.Open)
                {
                    await conn.OpenAsync();
                }

                using (var cmd = conn.CreateCommand())
                {
                    cmd.CommandText = @"
                        SELECT t.NAME AS TableName, i.rows AS [RowCount]
                        FROM sys.tables AS t
                        INNER JOIN sys.sysindexes AS i ON t.object_id = i.id
                        WHERE i.indid < 2 AND t.is_ms_shipped = 0
                        ORDER BY t.NAME";

                    using (var reader = await cmd.ExecuteReaderAsync())
                    {
                        while (await reader.ReadAsync())
                        {
                            tables.Add(new DbTableMetric
                            {
                                TableName = reader.GetString(0),
                                RowCount = Convert.ToInt32(reader.GetValue(1))
                            });
                        }
                    }
                }
            }
            catch
            {
                // Fallback to static counting of tracked sets if raw catalog fails
                tables.Add(new DbTableMetric { TableName = "AspNetUsers", RowCount = await _db.Users.CountAsync() });
                tables.Add(new DbTableMetric { TableName = "AspNetRoles", RowCount = await _db.Roles.CountAsync() });
            }

            viewModel.Diagnostics.Tables = tables;

            return View(viewModel);
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> CreateAdmin(SuperAdminDashboardViewModel model)
        {
            if (!ModelState.IsValid)
            {
                TempData["Error"] = "Failed to create administrator. Please fill in all fields correctly.";
                return RedirectToAction(nameof(Index));
            }

            var existingUser = await _userManager.FindByEmailAsync(model.NewAdmin.Email);
            if (existingUser != null)
            {
                TempData["Error"] = $"Email {model.NewAdmin.Email} is already registered.";
                return RedirectToAction(nameof(Index));
            }

            var newUser = new ApplicationUser
            {
                UserName = model.NewAdmin.Email,
                Email = model.NewAdmin.Email,
                FullName = model.NewAdmin.FullName,
                EmailConfirmed = true,
                IsActive = true,
                DateCreated = DateTime.Now
            };

            var result = await _userManager.CreateAsync(newUser, model.NewAdmin.Password);
            if (result.Succeeded)
            {
                // Verify and assign the requested role
                if (await _roleManager.RoleExistsAsync(model.NewAdmin.Role))
                {
                    await _userManager.AddToRoleAsync(newUser, model.NewAdmin.Role);
                }
                TempData["Success"] = $"Admin '{model.NewAdmin.FullName}' created successfully.";
                TempData["AuditEvent"] = $"Created admin account '{model.NewAdmin.FullName}' ({model.NewAdmin.Role})";
            }
            else
            {
                TempData["Error"] = "Error creating admin: " + string.Join(", ", result.Errors.Select(e => e.Description));
            }

            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ToggleActive(string id)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser != null && currentUser.Id == id)
            {
                TempData["Error"] = "You cannot deactivate your own account.";
                return RedirectToAction(nameof(Index));
            }

            var admin = await _userManager.FindByIdAsync(id);
            if (admin == null)
            {
                TempData["Error"] = "Admin account not found.";
                return RedirectToAction(nameof(Index));
            }

            if (await _userManager.IsInRoleAsync(admin, "SuperAdmin"))
            {
                TempData["Error"] = "Modifying SuperAdmin account status is not permitted.";
                return RedirectToAction(nameof(Index));
            }

            admin.IsActive = !admin.IsActive;
            var result = await _userManager.UpdateAsync(admin);

            if (result.Succeeded)
            {
                string status = admin.IsActive ? "activated" : "deactivated";
                TempData["Success"] = $"Admin account '{admin.FullName}' has been {status}.";
                TempData["AuditEvent"] = $"{(admin.IsActive ? "Activated" : "Deactivated")} admin account '{admin.FullName}'";
            }
            else
            {
                TempData["Error"] = "Failed to update account status.";
            }

            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ResetPassword(string id, string newPassword)
        {
            if (string.IsNullOrWhiteSpace(newPassword) || newPassword.Length < 6)
            {
                TempData["Error"] = "Password must be at least 6 characters long.";
                return RedirectToAction(nameof(Index));
            }

            var admin = await _userManager.FindByIdAsync(id);
            if (admin == null)
            {
                TempData["Error"] = "Admin account not found.";
                return RedirectToAction(nameof(Index));
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(admin);
            var result = await _userManager.ResetPasswordAsync(admin, token, newPassword);

            if (result.Succeeded)
            {
                TempData["Success"] = $"Password for '{admin.FullName}' was reset successfully.";
                TempData["AuditEvent"] = $"Reset password for admin account '{admin.FullName}'";
            }
            else
            {
                TempData["Error"] = "Error resetting password: " + string.Join(", ", result.Errors.Select(e => e.Description));
            }

            return RedirectToAction(nameof(Index));
        }

        [HttpPost]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> DeleteAdmin(string id)
        {
            var currentUser = await _userManager.GetUserAsync(User);
            if (currentUser != null && currentUser.Id == id)
            {
                TempData["Error"] = "You cannot delete your own account.";
                return RedirectToAction(nameof(Index));
            }

            var admin = await _userManager.FindByIdAsync(id);
            if (admin == null)
            {
                TempData["Error"] = "Admin account not found.";
                return RedirectToAction(nameof(Index));
            }

            if (await _userManager.IsInRoleAsync(admin, "SuperAdmin"))
            {
                TempData["Error"] = "Deletion of SuperAdmin accounts is not permitted.";
                return RedirectToAction(nameof(Index));
            }

            var result = await _userManager.DeleteAsync(admin);
            if (result.Succeeded)
            {
                TempData["Success"] = $"Admin account '{admin.FullName}' has been deleted.";
                TempData["AuditEvent"] = $"Deleted admin account '{admin.FullName}'";
            }
            else
            {
                TempData["Error"] = "Failed to delete administrator account.";
            }

            return RedirectToAction(nameof(Index));
        }
    }
}
