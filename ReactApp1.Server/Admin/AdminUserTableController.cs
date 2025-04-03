using back_end.Data;
using back_end.Models;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.VisualStudio.TestPlatform.CommunicationUtilities;
using Newtonsoft.Json.Linq;

namespace asp.Server.Admin
{
    [ApiController]
    [Route("api/[controller]")]
    public class AdminUserTableController : Controller
    {
        private readonly ApplicationDbContext _context;

        public AdminUserTableController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpDelete("User")]
        public async Task<IActionResult> DeleteUserByID(int id)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound(new { message = "The user was not found", status = 404 });
            }

            _context.Users.Remove(user);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Delete was successful", status = 200 });
        }

        [HttpPut("User")]
        public async Task<IActionResult> UpdateUserByID(int id, [FromBody] User updatedUser)
        {
            var user = await _context.Users.FindAsync(id);

            if (user == null)
            {
                return NotFound(new { message = "The user was not found", status = 404 });
            }

            user.Username = updatedUser.Username;
            user.Email = updatedUser.Email;
            user.Password = updatedUser.Password;
            user.ProfilePicture = updatedUser.ProfilePicture;
            user.Name = updatedUser.Name;
            user.BirthDate = updatedUser.BirthDate;
            user.Men = updatedUser.Men;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Update was successful", status = 200 });
        }


    }
}
