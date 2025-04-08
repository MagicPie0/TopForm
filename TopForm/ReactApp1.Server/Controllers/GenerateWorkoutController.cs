using Microsoft.AspNetCore.Mvc;
using System.Net.Http;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using System;

namespace WorkoutPlanner.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class GenerateWorkoutController : ControllerBase
    {
        private readonly HttpClient _httpClient;
        private readonly ILogger<GenerateWorkoutController> _logger;
        private readonly string _pythonApiUrl = "http://localhost:5000/generate";

        public GenerateWorkoutController(HttpClient httpClient, ILogger<GenerateWorkoutController> logger)
        {
            _httpClient = httpClient;
            _logger = logger;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateWorkout([FromBody] AiRequest request)
        {
            if (string.IsNullOrEmpty(request?.InputText))
            {
                return BadRequest(new { error = "InputText is required" });
            }

            try
            {
                _logger.LogInformation($"Sending request to Python API: {request.InputText.Substring(0, Math.Min(100, request.InputText.Length))}...");

                var response = await _httpClient.PostAsJsonAsync(_pythonApiUrl, new
                {
                    inputText = request.InputText
                });

                if (!response.IsSuccessStatusCode)
                {
                    var errorContent = await response.Content.ReadAsStringAsync();
                    _logger.LogError($"Python API returned error: {(int)response.StatusCode} - {errorContent}");
                    return StatusCode((int)response.StatusCode, new { error = $"Python API error: {errorContent}" });
                }

                var resultContent = await response.Content.ReadAsStringAsync();
                _logger.LogInformation($"Python API response received: {resultContent.Substring(0, Math.Min(100, resultContent.Length))}...");

                // Parse and validate the response
                try
                {
                    // Try to parse as JSON first
                    var jsonResponse = JsonSerializer.Deserialize<JsonElement>(resultContent);
                    return Ok(jsonResponse);
                }
                catch
                {
                    // If not valid JSON, return as text
                    return Ok(new { generatedText = resultContent });
                }
            }
            catch (HttpRequestException ex)
            {
                _logger.LogError($"HTTP request error: {ex.Message}");
                return StatusCode(503, new { error = $"Could not connect to Python API: {ex.Message}" });
            }
            catch (Exception ex)
            {
                _logger.LogError($"Unexpected error: {ex.Message}");
                return StatusCode(500, new { error = $"Server error: {ex.Message}" });
            }
        }

        [HttpGet("health")]
        public IActionResult HealthCheck()
        {
            return Ok(new
            {
                status = "healthy",
                timestamp = DateTime.UtcNow,
                service = "ASP.NET Workout Generator API"
            });
        }

        [HttpGet("python-status")]
        public async Task<IActionResult> PythonApiStatus()
        {
            try
            {
                var testRequest = new { InputText = "Connection test" };
                var response = await _httpClient.PostAsJsonAsync(_pythonApiUrl, testRequest);

                return Ok(new
                {
                    status = response.IsSuccessStatusCode ? "online" : "error",
                    statusCode = (int)response.StatusCode,
                    lastChecked = DateTime.UtcNow,
                    details = response.IsSuccessStatusCode ? "Fully operational" : await response.Content.ReadAsStringAsync()
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
        public string InputText { get; set; } = string.Empty;
    }
}