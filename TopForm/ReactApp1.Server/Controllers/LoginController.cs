using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using back_end.Data;
using back_end.Models;
using System.Threading.Tasks;
using BCrypt.Net;
using System.Net;

namespace back_end.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        // Titkos kulcs a JWT token aláírásához
        private const string JwtKey = "your-longer-secret-key-here-256-bitss"; // ✅ Titkos kulcs
        private const string JwtIssuer = "yourdomain.com"; // ✅ Kibocsátó
        private const string JwtAudience = "yourdomain.com"; // ✅ Címzett
        public AuthController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginRequest)
        {
            if (loginRequest == null || string.IsNullOrEmpty(loginRequest.Username) || string.IsNullOrEmpty(loginRequest.Password))
            {
                return BadRequest(new { message = "Username and password are required.", status = 400 });
            }

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.Username == loginRequest.Username);

            if (user == null)
            {
                return NotFound(new { message = "User not found.", field = "username", status = 404 });
            }

            // Ellenőrizd, hogy a jelszó mező nem NULL
            if (string.IsNullOrEmpty(user.Password))
            {
                return StatusCode(500, new { message = "User password is not set.", status = 500 });
            }

            // Ellenőrizzük a jelszót
            bool isValidPassword = BCrypt.Net.BCrypt.Verify(loginRequest.Password, user.Password);

            if (!isValidPassword)
            {
                return Unauthorized(new { message = "Invalid password.", field = "password", status = 401 });
            }

            // A jelszó helyes, folytassuk a belépéssel
            var token = GenerateJwtToken(user);
            return Ok(new { message = "Login successful", token, status = 200 });
        }

        // Token generáló metódus
        private string GenerateJwtToken(User user)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(JwtKey));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);
            var claims = new[]
           {
                new Claim("UserId", user.Id.ToString()),
                new Claim(ClaimTypes.Name, user.Username),
                new Claim(ClaimTypes.Email, user.Email ?? ""),
                new Claim("Name", user.Name ?? ""),
                new Claim("BirthDate", user.BirthDate?.ToString("yyyy-MM-dd") ?? "")
            };

            var jwt = new JwtSecurityToken(
                issuer: JwtIssuer,
                audience: JwtAudience,
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials
            );

            return new JwtSecurityTokenHandler().WriteToken(jwt);
        }

       
        public class LoginDto
        {
            public required string Username { get; set; }
            public required string Password { get; set; }
        }
    }
}
