using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;
using System;

namespace WorkoutPlanner.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GenerateWorkoutController : ControllerBase
    {
        private readonly HttpClient _httpClient;

        public GenerateWorkoutController(HttpClient httpClient)
        {
            _httpClient = httpClient;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateWorkout([FromBody] AiRequest request)
        {
            var json = System.Text.Json.JsonSerializer.Serialize(request);
            var content = new StringContent(json, Encoding.UTF8, "application/json");

            var response = await _httpClient.PostAsync("http://localhost:5000/generate", content);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                return Ok(result);
            }

            return StatusCode((int)response.StatusCode, await response.Content.ReadAsStringAsync());
        }

        [HttpGet("health")]  // Will be available at /api/GenerateWorkout/health
        public IActionResult HealthCheck()
        {
            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                service = "ASP.NET Workout Generator API"
            });
        }

        [HttpGet("python-status")]  // Will be available at /api/GenerateWorkout/python-status
        public async Task<IActionResult> PythonApiStatus()
        {
            try
            {
                var testRequest = new { InputText = "test connection" };
                var generateResponse = await _httpClient.PostAsJsonAsync("http://localhost:5000/generate", testRequest);

                return Ok(new
                {
                    status =  "online",
                    lastChecked = DateTime.UtcNow,
                    details = "Fully operational"
                });
            }
            catch (HttpRequestException ex)
            {
                return Ok(new
                {
                    status = "offline",
                    lastChecked = DateTime.UtcNow,
                    details = ex.Message
                });
            }
        }
    }

    public class AiRequest
    {
        public string InputText { get; set; }
    }
}