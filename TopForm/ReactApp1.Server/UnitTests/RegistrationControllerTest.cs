using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using System;
using System.Threading.Tasks;
using back_end.Controllers;
using back_end.Data;
using back_end.Models;
using asp.Server.Models;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Text;

namespace back_end.Tests
{
    [TestFixture]
    public class RegistrationControllerTests
    {
        private ApplicationDbContext _context;
        private Mock<ILogger<RegistrationController>> _loggerMock;
        private RegistrationController _controller;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _loggerMock = new Mock<ILogger<RegistrationController>>();
            _controller = new RegistrationController(_context, _loggerMock.Object);
        }

        [TearDown]
        public void TearDown()
        {
            _context.Dispose();
        }

        [Test]
        public async Task Register_ReturnsOk_WhenRegistrationIsSuccessful()
        {
            // Arrange
            var request = new RegisterDto
            {
                Username = "testuser",
                Email = "test@example.com",
                Password = "Test123!",
                Name = "Test User",
                BirthDate = new DateTime(1990, 1, 1)
            };

            // Act
            var result = await _controller.Register(request);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = result as OkObjectResult;
            Assert.That(okResult.Value, Has.Property("message").EqualTo("User registered successfully."));
            Assert.That(okResult.Value, Has.Property("jwt").Not.Null);

            // Verify user was created
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Username == "testuser");
            Assert.That(user, Is.Not.Null);
            Assert.That(user.Name, Is.EqualTo("Test User"));

            // Verify user activity was created
            var userActivity = await _context.UserActivity.FirstOrDefaultAsync(ua => ua.UserId == user.Id);
            Assert.That(userActivity, Is.Not.Null);
        }

        [Test]
        public async Task Register_ReturnsBadRequest_WhenUsernameExists()
        {
            // Arrange
            var existingUser = new User
            {
                Username = "existinguser",
                Email = "existing@example.com",
                Password = "hashedpassword",
                Name = "Existing User",
                BirthDate = new DateTime(1990, 1, 1)
            };
            await _context.Users.AddAsync(existingUser);
            await _context.SaveChangesAsync();

            var request = new RegisterDto
            {
                Username = "existinguser", // Same username
                Email = "new@example.com",
                Password = "Test123!",
                Name = "New User",
                BirthDate = new DateTime(1990, 1, 1)
            };

            // Act
            var result = await _controller.Register(request);

            // Assert
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
            var badRequestResult = result as BadRequestObjectResult;
            Assert.That(badRequestResult.Value, Has.Property("message").EqualTo("Username already exists."));
            Assert.That(badRequestResult.Value, Has.Property("field").EqualTo("username"));
        }

        [Test]
        public async Task Register_ReturnsBadRequest_WhenBirthDateIsMissing()
        {
            // Arrange
            var request = new RegisterDto
            {
                Username = "testuser",
                Email = "test@example.com",
                Password = "Test123!",
                Name = "Test User",
                BirthDate = null // Missing birth date
            };

            // Act
            var result = await _controller.Register(request);

            // Assert
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
            var badRequestResult = result as BadRequestObjectResult;
            Assert.That(badRequestResult.Value, Has.Property("message").EqualTo("Birth date is required."));
            Assert.That(badRequestResult.Value, Has.Property("field").EqualTo("birthDate"));
        }

        [Test]
        public async Task Register_ReturnsBadRequest_WhenUsernameIsMissing()
        {
            // Arrange
            var request = new RegisterDto
            {
                Username = "", // Missing username
                Email = "test@example.com",
                Password = "Test123!",
                Name = "Test User",
                BirthDate = new DateTime(1990, 1, 1)
            };

            // Act
            var result = await _controller.Register(request);

            // Assert
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
            var badRequestResult = result as BadRequestObjectResult;
            Assert.That(badRequestResult.Value, Has.Property("message").EqualTo("Username and password are required."));
        }

        [Test]
        public async Task Register_ReturnsInternalServerError_WhenDatabaseFails()
        {
            // Arrange
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "FailingDatabase")
                .Options;

            // Mockoljuk a SaveChangesAsync-t, hogy mindig hibát dobjon
            var mockContext = new FailingApplicationDbContext(options);

            var controller = new RegistrationController(mockContext, _loggerMock.Object);

            var request = new RegisterDto
            {
                Username = "testuser",
                Email = "test@example.com",
                Password = "Test123!",
                Name = "Test User",
                BirthDate = new DateTime(1990, 1, 1)
            };

            // Act
            var result = await controller.Register(request);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = result as ObjectResult;
            Assert.That(objectResult.StatusCode, Is.EqualTo(500));
            Assert.That(objectResult.Value, Has.Property("message").EqualTo("An internal server error occurred."));

            // Verify the error was logged
            _loggerMock.Verify(
                x => x.Log(
                    LogLevel.Error,
                    It.IsAny<EventId>(),
                    It.Is<It.IsAnyType>((v, t) => v.ToString().Contains("An error occurred during user registration")),
                    It.IsAny<Exception>(),
                    It.Is<Func<It.IsAnyType, Exception, string>>((v, t) => true)),
                Times.Once);
        }

        // Segédosztály ami mindig hibát dob
        public class FailingApplicationDbContext : ApplicationDbContext
        {
            public FailingApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
                : base(options) { }

            public override Task<int> SaveChangesAsync(CancellationToken cancellationToken = default)
            {
                throw new Exception("Database failure");
            }
        }



        [Test]
        public void GenerateJwtToken_ReturnsValidToken()
        {
            // Arrange
            var user = new User
            {
                Id = 1,
                Username = "testuser",
                Password = "hashedpassword",
                Email = "test@example.com",
                Name = "Test User",
                BirthDate = new DateTime(1990, 1, 1)
            };

            // Act - Reflection használata privát metódus eléréséhez
            var methodInfo = typeof(RegistrationController)
                .GetMethod("GenerateJwtToken", System.Reflection.BindingFlags.NonPublic | System.Reflection.BindingFlags.Instance);

            Assert.That(methodInfo, Is.Not.Null, "A GenerateJwtToken metódus nem található");

            var token = (string)methodInfo.Invoke(_controller, new object[] { user });

            // Assert
            Assert.That(token, Is.Not.Null.And.Not.Empty);

            // Token validáció
            var tokenHandler = new JwtSecurityTokenHandler();
            var validationParameters = new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("your-longer-secret-key-here-256-bitss")),
                ValidateIssuer = true,
                ValidIssuer = "yourdomain.com",
                ValidateAudience = true,
                ValidAudience = "yourdomain.com",
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            };

            var principal = tokenHandler.ValidateToken(token, validationParameters, out _);
            Assert.That(principal.FindFirst("UserId")?.Value, Is.EqualTo("1"));
            Assert.That(principal.FindFirst(ClaimTypes.Name)?.Value, Is.EqualTo("testuser"));
        }
    }
}