using back_end.Data;
using back_end.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using System;
using Microsoft.AspNetCore.Authorization;
using System.Linq;
using BCrypt.Net;

namespace asp.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly string _jwtSecretKey = "your-longer-secret-key-here-256-bitss"; 
        private readonly string _jwtIssuer = "yourdomain.com"; 
        private readonly string _jwtAudience = "yourdomain.com"; 

        public UserController(ApplicationDbContext context)
        {
            _context = context;
        }
        public static string HashPassword(string password)
        {
            return BCrypt.Net.BCrypt.HashPassword(password); 
        }

        public static bool VerifyPassword(string inputPassword, string storedHash)
        {
            return BCrypt.Net.BCrypt.Verify(inputPassword, storedHash); 
        }
        private ClaimsPrincipal ValidateToken(string token)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.UTF8.GetBytes(_jwtSecretKey);

            try
            {
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = _jwtIssuer,
                    ValidAudience = _jwtAudience,
                    IssuerSigningKey = new SymmetricSecurityKey(key)
                };

                var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
                return principal;
            }
            catch (Exception ex)
            {
                Console.WriteLine("Token validation error: " + ex.Message);
                return null;
            }
        }

        [HttpPost("upload-profile-picture")]
        public async Task<IActionResult> UploadProfilePicture([FromBody] ImageRequest imageRequest)
        {
            if (string.IsNullOrEmpty(imageRequest?.Base64Image))
            {
                return BadRequest("No image data provided.");
            }

            try
            {
                byte[] imageBytes = Convert.FromBase64String(imageRequest.Base64Image);

                var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
                if (string.IsNullOrEmpty(token))
                {
                    return Unauthorized("Token is required");
                }

                var principal = ValidateToken(token);
                if (principal == null)
                {
                    return Unauthorized("Invalid token");
                }

                var userIdClaim = principal.FindFirst("UserId")?.Value;
                if (userIdClaim == null)
                {
                    return Unauthorized("Invalid token claims");
                }

                var userId = int.Parse(userIdClaim);
                var user = await _context.Users.FindAsync(userId);

                if (user == null)
                {
                    return NotFound("User not found");
                }

                user.ProfilePicture = imageBytes;
                await _context.SaveChangesAsync();

                return Ok(new { message = "Profile picture uploaded successfully" });
            }
            catch (FormatException)
            {
                return BadRequest("Invalid base64 string format.");
            }
        }

        [HttpGet("get-profile-picture")]
        public async Task<IActionResult> GetProfilePicture()
        {
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized("Token is required");
            }

            var principal = ValidateToken(token);
            if (principal == null)
            {
                return Unauthorized("Invalid token");
            }

            var userIdClaim = principal.FindFirst("UserId")?.Value;
            if (userIdClaim == null)
            {
                return Unauthorized("Invalid token claims");
            }

            var userId = int.Parse(userIdClaim);
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound("User not found");
            }

            if (user.ProfilePicture == null)
            {
                return NotFound("Profile picture not found");
            }

            return File(user.ProfilePicture, "image/jpeg");
        }

        [Authorize]
        [HttpPost("update")]
        public async Task<IActionResult> UpdateUser([FromBody] UpdateUserDto updateUserDto)
        {
            if (updateUserDto == null)
            {
                return BadRequest("Invalid request data.");
            }

            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized("Token is required");
            }

            var principal = ValidateToken(token);
            if (principal == null)
            {
                return Unauthorized("Invalid token");
            }

            var userIdClaim = principal.FindFirst("UserId")?.Value;
            if (userIdClaim == null)
            {
                return Unauthorized("Invalid token claims");
            }

            var userId = int.Parse(userIdClaim);
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
            {
                return NotFound("User not found.");
            }

            if (!string.IsNullOrEmpty(updateUserDto.OldPassword))
            {
                if (!VerifyPassword(updateUserDto.OldPassword, user.Password)) 
                {
                    return BadRequest("Old password is incorrect.");
                }
            }
            else if (!string.IsNullOrEmpty(updateUserDto.NewPassword))
            {
                return BadRequest("Old password is required to change the password.");
            }


            if (!string.IsNullOrEmpty(updateUserDto.NewUsername))
            {
                user.Username = updateUserDto.NewUsername;
            }

            if (!string.IsNullOrEmpty(updateUserDto.NewPassword))
            {
                user.Password = HashPassword(updateUserDto.NewPassword); 
            }

            await _context.SaveChangesAsync();

            return Ok("Profile updated successfully.");
        }

        [HttpGet("details")]
        public async Task<IActionResult> GetUserDetails()
        {
            var token = Request.Headers["Authorization"].ToString().Replace("Bearer ", "");
            if (string.IsNullOrEmpty(token))
            {
                return Unauthorized("Token is required");
            }

            var principal = ValidateToken(token);
            if (principal == null)
            {
                return Unauthorized("Invalid token");
            }

            var userIdClaim = principal.FindFirst("UserId")?.Value;
            if (userIdClaim == null)
            {
                return Unauthorized("Invalid token claims");
            }

            var userId = int.Parse(userIdClaim);
            var user = await _context.Users.FindAsync(userId);

            if (user == null)
            {
                return NotFound("User not found");
            }

            return Ok(new { name = user.Name, username = user.Username, email = user.Email });
        }

        public class ImageRequest
        {
            public string Base64Image { get; set; }
        }

        public class UpdateUserDto
        {
            public string OldPassword { get; set; }
            public string NewUsername { get; set; }
            public string NewPassword { get; set; }
        }
    }
}