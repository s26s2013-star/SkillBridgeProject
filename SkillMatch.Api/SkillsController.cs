using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillMatch.Api.Data;
using SkillMatch.Api.Models;

namespace SkillMatch.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SkillsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public SkillsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/skills/user/5
        [HttpGet("user/{userId}")]
        public async Task<ActionResult<IEnumerable<UserSkill>>> GetUserSkills(int userId)
        {
            return await _context.UserSkills
                .Where(us => us.UserId == userId)
                .ToListAsync();
        }

        // POST: api/skills
        [HttpPost]
        public async Task<ActionResult<UserSkill>> AddSkill([FromBody] UserSkill userSkill)
        {
            if (userSkill == null)
                return BadRequest(new { message = "Skill data is required." });

            try
            {
                _context.UserSkills.Add(userSkill);
                await _context.SaveChangesAsync();

                return CreatedAtAction(nameof(GetUserSkills), new { userId = userSkill.UserId }, userSkill);
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Error adding skill.", details = ex.Message });
            }
        }

        // DELETE: api/skills/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteSkill(int id)
        {
            var skill = await _context.UserSkills.FindAsync(id);
            if (skill == null)
            {
                return NotFound(new { message = "Skill not found." });
            }

            _context.UserSkills.Remove(skill);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Skill deleted successfully." });
        }
    }
}
