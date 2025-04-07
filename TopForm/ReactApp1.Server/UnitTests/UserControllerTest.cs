using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Security.Claims;
using System;
using asp.Server.Controllers;
using back_end.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using NUnit.Framework;
using back_end.Models;


namespace back_end.Tests
{
    [TestFixture]
    public class UserControllerTests
    {
        private Mock<ApplicationDbContext> _mockContext;
        private UserController _controller;
        private User _mockUser;
        private string _jwtSecretKey = "your-longer-secret-key-here-256-bitss"; // A kulcsot ugyanúgy kell használnod, mint az alkalmazásban

        [SetUp]
        public void Setup()
        {
            // DbContextOptions létrehozása
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                          .UseInMemoryDatabase("TestDatabase") // InMemory adatbázis használata
                          .Options;

            // ApplicationDbContext mockolása
            _mockContext = new Mock<ApplicationDbContext>(options);
            _mockUser = new User
            {
                Id = 1,
                Username = "testuser",
                Email = "test@example.com",
                Password = "hashedpassword",
                Name = "Test Name",
                ProfilePicture = null
            };

            var userDbSet = new Mock<DbSet<User>>();
            var userList = new List<User> { _mockUser }.AsQueryable();

            userDbSet.As<IQueryable<User>>().Setup(m => m.Provider).Returns(userList.Provider);
            userDbSet.As<IQueryable<User>>().Setup(m => m.Expression).Returns(userList.Expression);
            userDbSet.As<IQueryable<User>>().Setup(m => m.ElementType).Returns(userList.ElementType);
            userDbSet.As<IQueryable<User>>().Setup(m => m.GetEnumerator()).Returns(userList.GetEnumerator());

            _mockContext.Setup(m => m.Users).Returns(userDbSet.Object);
            _mockContext.Setup(m => m.Users.FindAsync(1)).ReturnsAsync(_mockUser);
            _mockContext.Setup(m => m.SaveChangesAsync(default)).ReturnsAsync(1);

            _controller = new UserController(_mockContext.Object);

            // JWT token generálása a teszt számára
            var claims = new List<Claim> { new Claim("UserId", "1") };
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_jwtSecretKey));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: "yourdomain.com",
                audience: "yourdomain.com",
                claims: claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: creds
            );

            var tokenHandler = new JwtSecurityTokenHandler();
            var generatedToken = tokenHandler.WriteToken(token);

            // Beállítjuk a valid JWT-t az Authorization header-be
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    Request = { Headers = { { "Authorization", "Bearer " + generatedToken } } }
                }
            };
        }

        [Test]
        public async Task UploadProfilePicture_ValidRequest_ReturnsOk()
        {
            // Arrange
            var base64Image = Convert.ToBase64String(Encoding.UTF8.GetBytes("fake-image-content"));
            var imageRequest = new UserController.ImageRequest
            {
                Base64Image = base64Image
            };

            // Act
            var result = await _controller.UploadProfilePicture(imageRequest);

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = result as OkObjectResult;
            Assert.That(okResult?.Value.ToString(), Does.Contain("Profile picture uploaded"));
            Assert.That(_mockUser.ProfilePicture, Is.Not.Null);
        }

        [Test]
        public async Task UploadProfilePicture_InvalidBase64_ReturnsBadRequest()
        {
            var imageRequest = new UserController.ImageRequest
            {
                Base64Image = "not-a-valid-base64"
            };

            var result = await _controller.UploadProfilePicture(imageRequest);

            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task UploadProfilePicture_NoToken_ReturnsUnauthorized()
        {
            _controller.ControllerContext.HttpContext.Request.Headers["Authorization"] = "";

            var imageRequest = new UserController.ImageRequest
            {
                Base64Image = Convert.ToBase64String(Encoding.UTF8.GetBytes("fake-image-content"))
            };

            var result = await _controller.UploadProfilePicture(imageRequest);

            Assert.That(result, Is.InstanceOf<UnauthorizedObjectResult>());
        }
    }

}
