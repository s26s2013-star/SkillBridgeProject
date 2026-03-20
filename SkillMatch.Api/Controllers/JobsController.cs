using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillMatch.Api.Data;
using SkillMatch.Api.Models;
using CsvHelper;
using CsvHelper.Configuration;
using System.Globalization;

namespace SkillMatch.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class JobsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public JobsController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Job>>> GetJobs()
        {
            return await _context.Jobs.ToListAsync();
        }

        [HttpPost("seed")]
        public async Task<IActionResult> SeedJobs()
        {
            string csvPath = @"C:\Users\user\OneDrive - University of Technology and Applied Sciences\Desktop\jobData.csv";
            
            if (!System.IO.File.Exists(csvPath))
            {
                return NotFound("CSV file not found at the specified path.");
            }

            try
            {
                var config = new CsvConfiguration(CultureInfo.InvariantCulture)
                {
                    HasHeaderRecord = true,
                    MissingFieldFound = null,
                    HeaderValidated = null,
                };

                using (var reader = new StreamReader(csvPath, System.Text.Encoding.GetEncoding("latin-1")))
                using (var csv = new CsvReader(reader, config))
                {
                    var records = csv.GetRecords<dynamic>().ToList();
                    var jobs = new List<Job>();

                    foreach (var record in records)
                    {
                        var dict = (IDictionary<string, object>)record;
                        
                        jobs.Add(new Job
                        {
                            Job_ID = dict.ContainsKey("Job_ID") ? dict["Job_ID"]?.ToString() ?? "" : "",
                            Title = dict.ContainsKey("Job_Title") ? dict["Job_Title"]?.ToString() ?? "" : "",
                            Company = dict.ContainsKey("Company") ? dict["Company"]?.ToString() ?? "" : "",
                            Location = dict.ContainsKey("Location") ? dict["Location"]?.ToString() ?? "" : "",
                            Job_Type = dict.ContainsKey("Job_Type") ? dict["Job_Type"]?.ToString() ?? "" : "",
                            Experience_Required = dict.ContainsKey("Experience_Required") ? dict["Experience_Required"]?.ToString() ?? "" : "",
                            Key_Skills = dict.ContainsKey("Key_Skills") ? dict["Key_Skills"]?.ToString() ?? "" : "",
                            Soft_Skills = dict.ContainsKey("Soft_Skills") ? dict["Soft_Skills"]?.ToString() ?? "" : "",
                            Qualifications = dict.ContainsKey("Qualifications") ? dict["Qualifications"]?.ToString() ?? "" : "",
                            Description = dict.ContainsKey("Job_Description") ? dict["Job_Description"]?.ToString() ?? "" : "",
                            Source_URL = dict.ContainsKey("Source_URL") ? dict["Source_URL"]?.ToString() ?? "" : "",
                            Industry = dict.ContainsKey("Industry") ? dict["Industry"]?.ToString() ?? "" : ""
                        });
                    }

                    if (jobs.Any())
                    {
                        // Clear existing jobs if any (optional, but good for re-seeding)
                        // var existingJobs = await _context.Jobs.ToListAsync();
                        // _context.Jobs.RemoveRange(existingJobs);
                        
                        await _context.Jobs.AddRangeAsync(jobs);
                        await _context.SaveChangesAsync();
                        return Ok(new { Message = $"Successfully seeded {jobs.Count} jobs from CSV." });
                    }

                    return BadRequest("No records found in CSV.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
