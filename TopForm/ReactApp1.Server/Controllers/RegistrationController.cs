using Microsoft.AspNetCore.Mvc;
using System.Threading.Tasks;
using back_end.Data;
using back_end.Models;
using Microsoft.EntityFrameworkCore;
using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;
using asp.Server.Models;

namespace back_end.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class RegistrationController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<RegistrationController> _logger;

        private const string JwtKey = "your-longer-secret-key-here-256-bitss"; 
        private const string JwtIssuer = "yourdomain.com"; 
        private const string JwtAudience = "yourdomain.com"; 

        public RegistrationController(ApplicationDbContext context, ILogger<RegistrationController> logger)
        {
            _context = context;
            _logger = logger;
        }


        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto request)
        {
            if (request == null || string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Username and password are required.", status = 400 });
            }

            if (await UserExists(request.Username))
            {
                return BadRequest(new { message = "Username already exists.", field = "username", status = 400 });
            }

            if (request.BirthDate == null)
            {
                return BadRequest(new { message = "Birth date is required.", field = "birthDate", status = 400 });
            }

            string hashedPassword = BCrypt.Net.BCrypt.HashPassword(request.Password);

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    var user = new User
                    {
                        Username = request.Username,
                        Email = request.Email,
                        Name = request.Name,
                        BirthDate = request.BirthDate.Value,
                        Password = hashedPassword
                    };

                    await _context.Users.AddAsync(user);
                    await _context.SaveChangesAsync();

                    var userActivity = new user_activity
                    {
                        UserId = user.Id,
                    };

                    await _context.UserActivity.AddAsync(userActivity);
                    await _context.SaveChangesAsync();

                    await transaction.CommitAsync();

                    string jwt = GenerateJwtToken(user);

                    return Ok(new { message = "User registered successfully.", jwt = jwt, status = 200 });
                }
                catch (Exception ex)
                {
                    await transaction.RollbackAsync();
                    _logger.LogError(ex, "An error occurred during user registration.");

                    var innerExceptionMessage = ex.InnerException != null ? ex.InnerException.Message : "No inner exception";

                    return StatusCode(500, new
                    {
                        message = "An internal server error occurred.",
                        error = ex.Message,
                        innerError = innerExceptionMessage, 
                        stackTrace = ex.StackTrace,
                        status = 500
                    });
                }
            }
        }


        private async Task<bool> UserExists(string username)
        {
            return await _context.Users.AnyAsync(u => u.Username == username);
        }



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
    }

    public class RegisterDto
    {
        public string Username { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public DateTime? BirthDate { get; set; }
    }
}
