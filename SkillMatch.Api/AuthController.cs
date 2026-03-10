using Microsoft.AspNetCore.Mvc;

namespace SkillMatch.Api.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        [HttpPost("register")]
        public IActionResult Register([FromBody] RegisterRequest request)
        {
            if (request == null)
                return BadRequest(new { message = "Invalid request" });

            return Ok(new
            {
                message = "Registration successful",
                user = new
                {
                    name = request.Name,
                    email = request.Email,
                    role = request.Role
                }
            });
        }

        [HttpPost("login")]
        public IActionResult Login([FromBody] LoginRequest request)
        {
            if (request == null)
                return BadRequest(new { message = "Invalid request" });

            return Ok(new
            {
                token = "demo-jwt-token",
                user = new
                {
                    email = request.Email,
                    name = "Demo User",
                    role = "student"
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