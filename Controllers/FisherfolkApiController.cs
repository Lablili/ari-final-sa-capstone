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
                    id                 = f.Id,
                    completeName       = f.Fname + " " + (f.Mname ?? "") + " " + f.Lname,
                    address            = f.Address,
                    barangay           = f.Barangay,
                    birthdate          = f.Birthdate.ToString("yyyy-MM-dd"),
                    age                = f.Age,
                    gender             = f.Gender,
                    vesselType         = f.VesselType,
                    vesselName         = f.VesselName,
                    boatNumber         = f.BoatNumber,
                    permitNumber       = f.PermitNumber ?? "",
                    captureMethod      = f.CaptureMethod,
                    contactNumber      = f.ContactNumber,
                    registrationStatus = f.RegistrationStatus
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
                Fname             = fname,
                Lname             = lname,
                Mname             = mname,
                Address           = dto.Address ?? "",
                Barangay          = dto.Barangay ?? "",
                Birthdate         = DateTime.TryParse(dto.Birthdate, out var bd) ? bd : DateTime.MinValue,
                Age               = dto.Age,
                Gender            = dto.Gender ?? "",
                VesselType        = dto.VesselType ?? "",
                VesselName        = dto.VesselName ?? "",
                BoatNumber        = dto.BoatNumber ?? "",
                PermitNumber      = dto.PermitNumber,
                CaptureMethod     = dto.CaptureMethod ?? "",
                ContactNumber     = dto.ContactNumber ?? "",
                RegistrationStatus = dto.RegistrationStatus ?? "Active",
                RegCode           = dto.BoatNumber ?? Guid.NewGuid().ToString()[..8].ToUpper(),
                IsActive          = true
            };

            _db.FisherfolkRegistries.Add(record);
            await _db.SaveChangesAsync();
            return Ok(new { id = record.Id });
        }

        // PUT api/fisherfolk/{id}
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] FisherfolkDto dto)
        {
            if (dto == null) return BadRequest();

            var record = await _db.FisherfolkRegistries.FindAsync(id);
            if (record == null) return NotFound();

            var nameParts = (dto.CompleteName ?? "").Trim().Split(' ', StringSplitOptions.RemoveEmptyEntries);
            record.Fname = nameParts.Length > 0 ? nameParts[0] : "-";
            record.Lname = nameParts.Length > 1 ? nameParts[^1] : "-";
            record.Mname = nameParts.Length > 2 ? string.Join(" ", nameParts[1..^1]) : null;

            record.Address = dto.Address ?? "";
            record.Barangay = dto.Barangay ?? "";
            record.Birthdate = DateTime.TryParse(dto.Birthdate, out var bd) ? bd : DateTime.MinValue;
            record.Age = dto.Age;
            record.Gender = dto.Gender ?? "";
            record.VesselType = dto.VesselType ?? "";
            record.VesselName = dto.VesselName ?? "";
            record.BoatNumber = dto.BoatNumber ?? "";
            record.PermitNumber = dto.PermitNumber;
            record.CaptureMethod = dto.CaptureMethod ?? "";
            record.ContactNumber = dto.ContactNumber ?? "";
            record.RegistrationStatus = dto.RegistrationStatus ?? "Active";

            await _db.SaveChangesAsync();
            return Ok();
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

