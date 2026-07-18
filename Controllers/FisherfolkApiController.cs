using ari_final_sa_capstone.Data;
using ari_final_sa_capstone.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace ari_final_sa_capstone.Controllers
{
    [Route("api/fisherfolk")]
    [ApiController]
    public class FisherfolkApiController : ControllerBase
    {
        private readonly ApplicationDbContext _db;
        public FisherfolkApiController(ApplicationDbContext db) => _db = db;

        // GET api/fisherfolk
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var records = await _db.FisherfolkRegistries
                .Select(f => new {
                    id                 = f.FrId,
                    completeName       = f.Frfname + " " + (f.Frmname ?? "") + " " + f.Frlname,
                    address            = f.Fraddress,
                    barangay           = f.Frbarangay,
                    birthdate          = f.Frbirthdate.ToString("yyyy-MM-dd"),
                    age                = f.Frage,
                    gender             = f.Frgender,
                    vesselType         = f.FrvesselType,
                    vesselName         = f.FrvesselName,
                    boatNumber         = f.FrboatNumber,
                    permitNumber       = f.FrpermitNumber ?? "",
                    captureMethod      = f.FrcaptureMethod,
                    contactNumber      = f.FrcontactNumber,
                    registrationStatus = f.FrregistrationStatus
                })
                .ToListAsync();

            return Ok(records);
        }

        // POST api/fisherfolk
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] FisherfolkDto dto)
        {
            if (dto == null) return BadRequest();

            // Split completeName into parts
            var nameParts = (dto.CompleteName ?? "").Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            var fname = nameParts.Length > 0 ? nameParts[0] : "-";
            var lname = nameParts.Length > 1 ? nameParts[^1] : "-";
            var mname = nameParts.Length > 2 ? string.Join(" ", nameParts[1..^1]) : null;

            var record = new FisherfolkRegistry
            {
                Frfname             = fname,
                Frlname             = lname,
                Frmname             = mname,
                Fraddress           = dto.Address ?? "",
                Frbarangay          = dto.Barangay ?? "",
                Frbirthdate         = DateTime.TryParse(dto.Birthdate, out var bd) ? bd : DateTime.MinValue,
                Frage               = dto.Age,
                Frgender            = dto.Gender ?? "",
                FrvesselType        = dto.VesselType ?? "",
                FrvesselName        = dto.VesselName ?? "",
                FrboatNumber        = dto.BoatNumber ?? "",
                FrpermitNumber      = dto.PermitNumber,
                FrcaptureMethod     = dto.CaptureMethod ?? "",
                FrcontactNumber     = dto.ContactNumber ?? "",
                FrregistrationStatus = dto.RegistrationStatus ?? "Active",
                FrregCode           = dto.BoatNumber ?? Guid.NewGuid().ToString()[..8].ToUpper(),
                FrisActive          = true
            };

            _db.FisherfolkRegistries.Add(record);
            await _db.SaveChangesAsync();
            return Ok(new { id = record.FrId });
        }

        // DELETE api/fisherfolk/{id}
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var record = await _db.FisherfolkRegistries.FindAsync(id);
            if (record == null) return NotFound();
            _db.FisherfolkRegistries.Remove(record);
            await _db.SaveChangesAsync();
            return Ok();
        }
    }

    public class FisherfolkDto
    {
        public string? CompleteName       { get; set; }
        public string? Address            { get; set; }
        public string? Barangay           { get; set; }
        public string? Birthdate          { get; set; }
        public int     Age                { get; set; }
        public string? Gender             { get; set; }
        public string? VesselType         { get; set; }
        public string? VesselName         { get; set; }
        public string? BoatNumber         { get; set; }
        public string? PermitNumber       { get; set; }
        public string? CaptureMethod      { get; set; }
        public string? ContactNumber      { get; set; }
        public string? RegistrationStatus { get; set; }
    }
}
