using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillMatch.Api.Data;
using SkillMatch.Api.Models;
using BCryptNet = BCrypt.Net.BCrypt;

namespace SkillMatch.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterRequest request)
        {
            if (request == null ||
                string.IsNullOrWhiteSpace(request.Name) ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Name, email, and password are required" });
            }

            var normalizedEmail = request.Email.Trim().ToLower();

            var existingUser = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

            if (existingUser != null)
            {
                return BadRequest(new { message = "Email already exists" });
            }

            var user = new User
            {
                Name = request.Name.Trim(),
                Email = normalizedEmail,
                PasswordHash = BCryptNet.HashPassword(request.Password),
                Role = string.IsNullOrWhiteSpace(request.Role) ? "student" : request.Role.Trim()
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new
            {
                message = "Registration successful",
                user = new
                {
                    id = user.Id,
                    name = user.Name,
                    email = user.Email,
                    role = user.Role
                }
            });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null ||
                string.IsNullOrWhiteSpace(request.Email) ||
                string.IsNullOrWhiteSpace(request.Password))
            {
                return BadRequest(new { message = "Email and password are required" });
            }

            var normalizedEmail = request.Email.Trim().ToLower();

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Email.ToLower() == normalizedEmail);

            if (user == null)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            var isPasswordValid = BCryptNet.Verify(request.Password, user.PasswordHash);

            if (!isPasswordValid)
            {
                return Unauthorized(new { message = "Invalid email or password" });
            }

            return Ok(new
            {
                token = "demo-jwt-token",
                user = new
                {
                    id = user.Id,
                    email = user.Email,
                    name = user.Name,
                    role = user.Role
                }
            });
        }
    }

    public class RegisterRequest
    {
        public string Name { get; set; } = "";
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
        public string Role { get; set; } = "";
    }

    public class LoginRequest
    {
        public string Email { get; set; } = "";
        public string Password { get; set; } = "";
    }
}