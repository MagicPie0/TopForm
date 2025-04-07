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

namespace back_end.Tests
{
    [TestFixture]
    public class GenerateWorkoutControllerTests
    {
        private Mock<HttpMessageHandler> _mockHttpMessageHandler;
        private HttpClient _httpClient;
        private GenerateWorkoutController _controller;

        [SetUp]
        public void Setup()
        {
            _mockHttpMessageHandler = new Mock<HttpMessageHandler>();
            _httpClient = new HttpClient(_mockHttpMessageHandler.Object);
            _controller = new GenerateWorkoutController(_httpClient);
        }

        [Test]
        public async Task GenerateWorkout_ReturnsOkResult_WhenApiCallSucceeds()
        {
            // Arrange
            var expectedResponse = "Generated workout plan";
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
                    Content = new StringContent(expectedResponse)
                });

            // Act
            var result = await _controller.GenerateWorkout(request);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = result as OkObjectResult;
            Assert.That(okResult.Value, Is.EqualTo(expectedResponse));
        }

        [Test]
        public async Task GenerateWorkout_ReturnsErrorStatusCode_WhenApiCallFails()
        {
            // Arrange
            var errorMessage = "Service unavailable";
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
                    StatusCode = HttpStatusCode.ServiceUnavailable,
                    Content = new StringContent(errorMessage)
                });

            // Act
            var result = await _controller.GenerateWorkout(request);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var statusCodeResult = result as ObjectResult;
            Assert.That(statusCodeResult.StatusCode, Is.EqualTo((int)HttpStatusCode.ServiceUnavailable));
            Assert.That(statusCodeResult.Value, Is.EqualTo(errorMessage));
        }

        [Test]
        public void HealthCheck_ReturnsOkWithHealthStatus()
        {
            // Act
            var result = _controller.HealthCheck();

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = result as OkObjectResult;
            var value = okResult.Value as dynamic;
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
            var value = okResult.Value as dynamic;
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
            var value = okResult.Value as dynamic;
            Assert.That(value.status.ToString(), Is.EqualTo("offline"));
            Assert.That(value.details.ToString(), Is.EqualTo(errorMessage));
        }
    }
}