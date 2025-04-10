using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back_end.Data;
using back_end.Models;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using System.Text.Json;
using back_end.Controllers;

namespace asp.Server.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class GetDietController : Controller
    {
        private readonly ApplicationDbContext _context;

        public GetDietController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpGet("diet")]
        public async Task<IActionResult> GetUserDietByDate([FromQuery] string date)
        {
            var userIdClaim = User.FindFirst("UserId")?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out int userId))
                return Unauthorized("Érvénytelen felhasználói azonosító.");

            if (!DateTime.TryParse(date, out var parsedDate))
                return BadRequest("Érvénytelen dátum formátum!");

            var userDietIds = await _context.UserActivity
                .Where(ua => ua.UserId == userId)
                .Select(ua => ua.DietId)
                .ToListAsync();

            if (!userDietIds.Any())
                return NotFound("A felhasználónak nincs diétája erre a napra.");

            var diets = await _context.Diet
                .Where(d => d.FoodDate.Date == parsedDate.Date && userDietIds.Contains(d.Id))
                .ToListAsync();

            if (!diets.Any())
                return NotFound("Nincs diéta erre a napra.");

            var parsedDiets = diets.Select(d => new
            {
                d.Id,
                d.FoodDate,
                Breakfast = !string.IsNullOrEmpty(d.Breakfast) ? JsonSerializer.Deserialize<List<FoodItem>>(d.Breakfast) : null,
                Lunch = !string.IsNullOrEmpty(d.Lunch) ? JsonSerializer.Deserialize<List<FoodItem>>(d.Lunch) : null,
                Diner = !string.IsNullOrEmpty(d.Diner) ? JsonSerializer.Deserialize<List<FoodItem>>(d.Diner) : null,
                Dessert = !string.IsNullOrEmpty(d.Dessert) ? JsonSerializer.Deserialize<List<FoodItem>>(d.Dessert) : null
            });

            return Ok(parsedDiets);
        }
    }
}
