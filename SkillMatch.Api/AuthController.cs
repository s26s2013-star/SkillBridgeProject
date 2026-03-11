using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SkillMatch.Api.Data;
using SkillMatch.Api.Models;
using BCrypt.Net;

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
            if (request == null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { message = "Name, Email, and Password are required." });

            try
            {
                // 1. Check if email already exists
                var existingUser = await _context.Users.AnyAsync(u => u.Email == request.Email);
                if (existingUser)
                {
                    return BadRequest(new { message = "Email already in use." });
                }

                // 2. Hash password using BCrypt
                string passwordHash = BCrypt.Net.BCrypt.HashPassword(request.Password);

                // 3. Create and Save user
                var user = new User
                {
                    Name = request.Name ?? "User",
                    Email = request.Email,
                    PasswordHash = passwordHash,
                    Role = string.IsNullOrWhiteSpace(request.Role) ? "Student" : request.Role
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
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during registration.", details = ex.Message });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (request == null || string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
                return BadRequest(new { message = "Email and Password are required." });

            try
            {
                // 1. Find user by email
                var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);
                if (user == null)
                {
                    // For security, don't specify if it's the email or password that's wrong
                    return Unauthorized(new { message = "Invalid email or password." });
                }

                // 2. Verify password
                bool isValid = BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash);
                if (!isValid)
                {
                    return Unauthorized(new { message = "Invalid email or password." });
                }

                // 3. Return success
                return Ok(new
                {
                    token = "demo-jwt-token", // Replace with real JWT later
                    user = new
                    {
                        id = user.Id,
                        name = user.Name,
                        email = user.Email,
                        role = user.Role
                    }
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An error occurred during login.", details = ex.Message });
            }
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
