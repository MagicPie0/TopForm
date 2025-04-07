using asp.Server.Models;
using back_end.Data;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json;

namespace back_end.Controllers
{
    [ApiController]
    [Authorize]
    [Route("api/[controller]")]
    public class DietController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public DietController(ApplicationDbContext context)
        {
            _context = context;
        }

        [HttpPost]
        [Authorize]
        public async Task<IActionResult> PostFood([FromBody] FoodRequest request)
        {
            if (request == null ||
                (request.Breakfast == null || !request.Breakfast.Any()) &&
                (request.Lunch == null || !request.Lunch.Any()) &&
                (request.Diner == null || !request.Diner.Any()) &&
                (request.Dessert == null || !request.Dessert.Any()))
            {
                return BadRequest(new { status = 400, message = "Request cannot be null" });
            }

            // A JWT-ből kinyerjük a felhasználói ID-t
            var userIdFromToken = User.FindFirst("UserId")?.Value;

            if (string.IsNullOrEmpty(userIdFromToken))
            {
                return Unauthorized(new { status = 401, message = "User not authorized" });
            }

            int userId = int.Parse(userIdFromToken);

            using (var transaction = await _context.Database.BeginTransactionAsync())
            {
                try
                {
                    // 1️⃣ Meal mentése
                    var diet = new Diet
                    {
                        Breakfast = request.Breakfast != null ? JsonSerializer.Serialize(request.Breakfast) : null,
                        Lunch = request.Lunch != null ? JsonSerializer.Serialize(request.Lunch) : null,
                        Diner = request.Diner != null ? JsonSerializer.Serialize(request.Diner) : null,
                        Dessert = request.Dessert != null ? JsonSerializer.Serialize(request.Dessert) : null,
                        FoodDate = DateTime.UtcNow.Date // Aktuális dátum
                    };

                    _context.Diet.Add(diet);
                    await _context.SaveChangesAsync();

                    // 2️⃣ UserActivity frissítése vagy létrehozása
                    var existingUserActivity = await _context.UserActivity
                        .FirstOrDefaultAsync(ua => ua.UserId == userId && ua.DietId == null);

                    if (existingUserActivity != null)
                    {
                        existingUserActivity.DietId = diet.Id;
                        _context.UserActivity.Update(existingUserActivity);
                    }
                    else
                    {
                        var existingRecord = await _context.UserActivity
                            .FirstOrDefaultAsync(ua => ua.UserId == userId && ua.MuscleGroupId != null && ua.DietId != null);

                        int? muscleGroupId = null;

                        if (existingRecord != null)
                        {
                            muscleGroupId = existingRecord.MuscleGroupId;
                        }

                        var userActivity = new user_activity
                        {
                            UserId = userId,
                            MuscleGroupId = muscleGroupId,
                            DietId = diet.Id
                        };
                        await _context.UserActivity.AddAsync(userActivity);
                    }

                    await _context.SaveChangesAsync();

                    // 3️⃣ Tranzakció commit
                    await transaction.CommitAsync();

                    return Ok(new { message = "Meal and user_activity saved successfully.", status = 200 });
                }
                catch (Exception ex)
                {
                    // 4️⃣ Tranzakció rollback hiba esetén
                    await transaction.RollbackAsync();
                    Console.WriteLine($"ERROR: {ex.InnerException?.Message ?? ex.Message}");
                    return StatusCode(500, new { message = $"Error: {ex.InnerException?.Message ?? ex.Message}", status = 500 });
                }
            }
        }
    }
    public class FoodItem
    {
        public required string Name { get; set; }       // Az étel neve
        public required string Portion { get; set; }    // Az étel adagja
        public required int Calories { get; set; }      // Az étel kalóriája
    }

    public class FoodRequest
    {
        public List<FoodItem>? Breakfast { get; set; } // Reggeli ételek
        public List<FoodItem>? Lunch { get; set; }     // Ebéd ételek
        public List<FoodItem>? Diner { get; set; }     // Vacsora ételek
        public List<FoodItem>? Dessert { get; set; }   // Desszert ételek
    }
}