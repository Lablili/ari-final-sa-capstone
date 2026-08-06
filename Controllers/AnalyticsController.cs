using System;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ari_final_sa_capstone.Data;

namespace ari_final_sa_capstone.Controllers
{
    public class AnalyticsController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AnalyticsController(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IActionResult> Dashboard()
        {
            var blotters = await _context.BlotterReports.ToListAsync();
            var totalIncidents = blotters.Count;
            var avgResponseTime = totalIncidents > 0 ? blotters.Average(b => b.ResponseTimeMinutes) : 0;
            var closedCases = blotters.Count(b => b.Status == "Closed");
            
            var smsLogs = await _context.SMSLogs.ToListAsync();
            var totalSmsSent = smsLogs.Count;
            var deliveredSms = smsLogs.Count(s => s.Status == "Delivered");
            var deliveryRate = totalSmsSent > 0 ? (double)deliveredSms / totalSmsSent * 100 : 0;

            var fisherfolk = await _context.FisherfolkRegistries.ToListAsync();
            var totalFisherfolk = fisherfolk.Count;
            
            var submissions = await _context.ReportSubmissions.ToListAsync();
            var activeUsers = submissions.Select(s => s.FisherfolkId).Distinct().Count();
            var adoptionRate = totalFisherfolk > 0 ? (double)activeUsers / totalFisherfolk * 100 : 0;

            ViewBag.TotalIncidents = totalIncidents;
            ViewBag.AvgResponseTime = Math.Round(avgResponseTime, 2);
            ViewBag.EnforcementRate = totalIncidents > 0 ? Math.Round((double)closedCases / totalIncidents * 100, 2) : 0;
            
            ViewBag.DeliveryRate = Math.Round(deliveryRate, 2);
            ViewBag.AdoptionRate = Math.Round(adoptionRate, 2);
            ViewBag.TotalFisherfolk = totalFisherfolk;

            // 1. Line Chart: Incidents Over Time
            var last12Months = Enumerable.Range(0, 12).Select(i => DateTime.Now.AddMonths(-11 + i)).ToList();
            var incidentsOverTime = last12Months.Select(m => new {
                Month = m.ToString("MMM yyyy"),
                Count = blotters.Count(b => b.IncidentDate.Year == m.Year && b.IncidentDate.Month == m.Month)
            }).ToList();
            
            ViewBag.TimeLabels = System.Text.Json.JsonSerializer.Serialize(incidentsOverTime.Select(x => x.Month));
            ViewBag.TimeData = System.Text.Json.JsonSerializer.Serialize(incidentsOverTime.Select(x => x.Count));

            // 2. Horizontal Bar: Incidents by Barangay (Location)
            var barangays = new[] { "Patao", "Guiwanon", "Sulangan", "Other" };
            var byBarangay = blotters.GroupBy(b => 
                barangays.Contains(b.Location) ? b.Location : "Other"
            ).Select(g => new { Barangay = g.Key, Count = g.Count() }).ToList();
            
            var bgyLabels = barangays.ToList();
            var bgyData = bgyLabels.Select(b => byBarangay.FirstOrDefault(x => x.Barangay == b)?.Count ?? 0).ToList();
            
            ViewBag.BarangayLabels = System.Text.Json.JsonSerializer.Serialize(bgyLabels);
            ViewBag.BarangayData = System.Text.Json.JsonSerializer.Serialize(bgyData);

            // 3. Radar Chart: Incident Types
            var incidentTypes = blotters.GroupBy(b => b.IncidentType)
                                        .Select(g => new { Type = g.Key, Count = g.Count() })
                                        .ToList();
            ViewBag.IncidentTypesLabels = System.Text.Json.JsonSerializer.Serialize(incidentTypes.Select(x => x.Type));
            ViewBag.IncidentTypesData = System.Text.Json.JsonSerializer.Serialize(incidentTypes.Select(x => x.Count));

            // 4. Doughnut Chart: Incidents by Status
            var incidentStatus = blotters.GroupBy(b => b.Status)
                                         .Select(g => new { Status = g.Key, Count = g.Count() })
                                         .ToList();
            ViewBag.IncidentStatusLabels = System.Text.Json.JsonSerializer.Serialize(incidentStatus.Select(x => x.Status));
            ViewBag.IncidentStatusData = System.Text.Json.JsonSerializer.Serialize(incidentStatus.Select(x => x.Count));

            return View();
        }

        public IActionResult SurveyEntry()
        {
            return View();
        }

        [HttpPost]
        public async Task<IActionResult> SubmitSurvey(string Question, string ResultData)
        {
            // For MVP manual entry
            var survey = new Models.SurveyResponse
            {
                Question = Question,
                ResponseValue = ResultData,
                Timestamp = DateTime.Now
            };
            _context.SurveyResponses.Add(survey);
            await _context.SaveChangesAsync();
            return RedirectToAction(nameof(Dashboard));
        }
    }
}
