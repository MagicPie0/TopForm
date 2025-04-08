using NUnit.Framework;
using Microsoft.AspNetCore.Mvc;
using System.Net;
using System.Net.Http;
using System.Threading;
using System.Threading.Tasks;
using System.Text;
using System.Text.Json;
using Moq;
using Moq.Protected;
using WorkoutPlanner.Controllers;
using Microsoft.Extensions.Logging;
using System.Dynamic;

namespace back_end.Tests
{
    [TestFixture]
    public class GenerateWorkoutControllerTests
    {
        private Mock<HttpMessageHandler> _mockHttpMessageHandler;
        private HttpClient _httpClient;
        private Mock<ILogger<GenerateWorkoutController>> _mockLogger;
        private GenerateWorkoutController _controller;

        [SetUp]
        public void Setup()
        {
            _mockHttpMessageHandler = new Mock<HttpMessageHandler>();
            _httpClient = new HttpClient(_mockHttpMessageHandler.Object);
            _mockLogger = new Mock<ILogger<GenerateWorkoutController>>();
            _controller = new GenerateWorkoutController(_httpClient, _mockLogger.Object);
        }

        [Test]
        public async Task GenerateWorkout_ReturnsOkResult_WhenApiCallSucceeds()
        {
            // Arrange
            var expectedResponse = "{\"generatedText\":\"Generated workout plan\"}";
            var request = new AiRequest { InputText = "Create a workout plan" };

            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent(expectedResponse, Encoding.UTF8, "application/json")
                });

            // Act
            var result = await _controller.GenerateWorkout(request);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = result as OkObjectResult;

            // Properly handle the JsonElement response
            var jsonElement = (JsonElement)okResult.Value;
            var responseObject = JsonSerializer.Deserialize<ExpandoObject>(jsonElement.GetRawText());
            var responseDict = (IDictionary<string, object>)responseObject;

            Assert.That(responseDict["generatedText"].ToString(), Is.EqualTo("Generated workout plan"));
        }

      

        [Test]
        public void HealthCheck_ReturnsOkWithHealthStatus()
        {
            // Act
            var result = _controller.HealthCheck();

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = result as OkObjectResult;
            dynamic value = okResult.Value;
            Assert.That(value.status.ToString(), Is.EqualTo("healthy"));
            Assert.That(value.service.ToString(), Is.EqualTo("ASP.NET Workout Generator API"));
        }

        [Test]
        public async Task PythonApiStatus_ReturnsOnlineStatus_WhenApiIsAvailable()
        {
            // Arrange
            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ReturnsAsync(new HttpResponseMessage
                {
                    StatusCode = HttpStatusCode.OK,
                    Content = new StringContent("test response")
                });

            // Act
            var result = await _controller.PythonApiStatus();

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = result as OkObjectResult;
            dynamic value = okResult.Value;
            Assert.That(value.status.ToString(), Is.EqualTo("online"));
            Assert.That(value.details.ToString(), Is.EqualTo("Fully operational"));
        }

        [Test]
        public async Task PythonApiStatus_ReturnsOfflineStatus_WhenApiThrowsException()
        {
            // Arrange
            var errorMessage = "Connection refused";

            _mockHttpMessageHandler
                .Protected()
                .Setup<Task<HttpResponseMessage>>(
                    "SendAsync",
                    ItExpr.IsAny<HttpRequestMessage>(),
                    ItExpr.IsAny<CancellationToken>()
                )
                .ThrowsAsync(new HttpRequestException(errorMessage));

            // Act
            var result = await _controller.PythonApiStatus();

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = result as OkObjectResult;
            dynamic value = okResult.Value;
            Assert.That(value.status.ToString(), Is.EqualTo("offline"));
            Assert.That(value.details.ToString(), Is.EqualTo(errorMessage));
        }

        [Test]
        public async Task GenerateWorkout_ReturnsBadRequest_WhenInputIsEmpty()
        {
            // Arrange
            var request = new AiRequest { InputText = "" };

            // Act
            var result = await _controller.GenerateWorkout(request);

            // Assert
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
            var badRequestResult = result as BadRequestObjectResult;
            dynamic value = badRequestResult.Value;
            Assert.That(value.error.ToString(), Is.EqualTo("InputText is required"));
        }
    }
}