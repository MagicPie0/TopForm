using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

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

            // A Python API URL-ja, amely végrehajtja a generálást
            var response = await _httpClient.PostAsync("http://localhost:5000/generate", content);

            if (response.IsSuccessStatusCode)
            {
                var result = await response.Content.ReadAsStringAsync();
                return Ok(result); // Válasz visszaküldése
            }

            return StatusCode((int)response.StatusCode, "Error generating workout plan.");
        }
    }

    public class AiRequest
    {
        public string InputText { get; set; }
    }
}
