using Microsoft.EntityFrameworkCore;
using System.Linq;
using ari_final_sa_capstone.Data;
using ari_final_sa_capstone.Models;
using Microsoft.AspNetCore.Identity;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllersWithViews();
builder.Services.AddSession(); // Session for UI-only fake auth

// Configure EF Core + Identity
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? "Server=(localdb)\\mssqllocaldb;Database=ari_capstone_db;Trusted_Connection=True;MultipleActiveResultSets=true";
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(connectionString));

builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    // Password policy defaults (tweak as needed)
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.Password.RequireNonAlphanumeric = false;
    options.Password.RequireUppercase = false;
    options.Password.RequireLowercase = false;
})
    .AddEntityFrameworkStores<ApplicationDbContext>()
    .AddDefaultTokenProviders();

builder.Services.ConfigureApplicationCookie(options =>
{
    options.ExpireTimeSpan = TimeSpan.FromDays(30);
    options.SlidingExpiration = true;
    options.LoginPath = "/Account/Login";
    options.AccessDeniedPath = "/Account/AccessDenied";
    options.Cookie.HttpOnly = true;
    options.Cookie.SameSite = Microsoft.AspNetCore.Http.SameSiteMode.Lax;
    options.Cookie.SecurePolicy = Microsoft.AspNetCore.Http.CookieSecurePolicy.SameAsRequest;
});

var app = builder.Build();

// Run migrations and seed identity data (roles + default SuperAdmin)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var db = services.GetRequiredService<ApplicationDbContext>();
        var logger = services.GetRequiredService<ILogger<Program>>();

        // Diagnostic: log connection string and whether AspNetUsers exists so we can pinpoint Invalid object name errors.
        try
        {
            var conn = db.Database.GetDbConnection();
            logger.LogInformation("Using database: {Database}", conn.Database);
            await conn.OpenAsync();

            using (var cmd = conn.CreateCommand())
            {
                cmd.CommandText = "SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'AspNetUsers'";
                using var reader = await cmd.ExecuteReaderAsync();
                if (await reader.ReadAsync())
                {
                    var schema = reader.GetString(0);
                    var table = reader.GetString(1);
                    logger.LogInformation("Found table: {Schema}.{Table}", schema, table);
                }
                else
                {
                    logger.LogWarning("AspNetUsers table not found. Listing available tables:");
                    // list all tables
                    reader.Close();
                    cmd.CommandText = "SELECT TABLE_SCHEMA, TABLE_NAME FROM INFORMATION_SCHEMA.TABLES ORDER BY TABLE_SCHEMA, TABLE_NAME";
                    using var r2 = await cmd.ExecuteReaderAsync();
                    while (await r2.ReadAsync())
                    {
                        logger.LogWarning(" - {Schema}.{Table}", r2.GetString(0), r2.GetString(1));
                    }
                }
            }
        }
        catch (Exception diagEx)
        {
            logger.LogWarning(diagEx, "Failed to inspect database schema for diagnostics.");
        }

        // Try to apply migrations if there are any. If applying migrations fails
        // (for example when running against an existing DB with incompatible schema),
        // fall back to EnsureCreated which will attempt to create the schema from the model.
        try
        {
            // Prefer applying migrations when the project contains them
            if (db.Database.GetMigrations().Any())
            {
                db.Database.Migrate();
                logger.LogInformation("Database migrations applied.");
            }
            else
            {
                db.Database.EnsureCreated();
                logger.LogInformation("Database ensured/created (no migrations present).");
            }
        }
        catch (Exception migrateEx)
        {
            logger.LogWarning(migrateEx, "Applying migrations failed; attempting EnsureCreated instead.");
            try
            {
                db.Database.EnsureCreated();
                logger.LogInformation("Database ensured/created via fallback.");
            }
            catch (Exception ensureEx)
            {
                logger.LogError(ensureEx, "EnsureCreated failed as a fallback. See inner exception for details.");
                throw; // stop startup so exception is visible
            }
        }

        await IdentitySeedData.SeedRolesAndAdminAsync(services);
    }
    catch (Exception ex)
    {
        var logger = services.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating or seeding the database.");
    }
}

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler("/Home/Error");
    // The default HSTS value is 30 days. You may want to change this for production scenarios, see https://aka.ms/aspnetcore-hsts.
    app.UseHsts();
}

app.UseHttpsRedirection();
app.UseStaticFiles();

app.UseRouting();

app.UseSession(); // Session must be before auth

app.UseAuthentication();
app.UseAuthorization();

app.MapControllerRoute(
    name: "default",
    pattern: "{controller=Home}/{action=Index}/{id?}");

app.Run();
