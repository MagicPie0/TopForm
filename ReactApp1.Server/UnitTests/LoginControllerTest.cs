using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using System.Threading.Tasks;
using Xunit;
using back_end.Controllers;
using back_end.Data;
using back_end.Models;
using System.Linq.Expressions;
using System.Collections.Generic;
using System.Linq;

namespace back_end.Tests
{
    public class AuthControllerTests
    {
        private readonly Mock<ApplicationDbContext> _mockContext;
        private readonly AuthController _controller;
        private readonly Mock<DbSet<User>> _mockDbSet;

        public AuthControllerTests()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
                .Options;

            _mockContext = new Mock<ApplicationDbContext>(options);
            _mockDbSet = new Mock<DbSet<User>>();
            _controller = new AuthController(_mockContext.Object);
        }

        [Fact]
        public async Task Login_ReturnsBadRequest_WhenUsernameOrPasswordIsNull()
        {
            // Arrange
            var loginRequest = new AuthController.LoginDto { Username = string.Empty, Password = string.Empty };

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            var badRequestResult = Assert.IsType<BadRequestObjectResult>(result);
            Assert.Equal(400, badRequestResult.StatusCode);
        }

        [Fact]
        public async Task Login_ReturnsNotFound_WhenUserDoesNotExist()
        {
            // Arrange
            var loginRequest = new AuthController.LoginDto { Username = "nonexistent", Password = "password" };

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
            Assert.Equal(404, notFoundResult.StatusCode);
        }

        [Fact]
        public async Task Login_ReturnsUnauthorized_WhenPasswordIsInvalid()
        {
            // Arrange
            var user = new LoginModel { Username = "testuser", Password = BCrypt.Net.BCrypt.HashPassword("correctpassword") };
            var users = new List<LoginModel> { user }.AsQueryable();

            _mockDbSet.As<IQueryable<LoginModel>>().Setup(m => m.Provider).Returns(users.Provider);
            _mockDbSet.As<IQueryable<LoginModel>>().Setup(m => m.Expression).Returns(users.Expression);
            _mockDbSet.As<IQueryable<LoginModel>>().Setup(m => m.ElementType).Returns(users.ElementType);
            _mockDbSet.As<IQueryable<LoginModel>>().Setup(m => m.GetEnumerator()).Returns(users.GetEnumerator());

            _mockContext.Setup(c => c.Users).Returns(_mockDbSet.Object);

            var loginRequest = new AuthController.LoginDto { Username = "testuser", Password = "wrongpassword" };

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            var unauthorizedResult = Assert.IsType<UnauthorizedObjectResult>(result);
            Assert.Equal(401, unauthorizedResult.StatusCode);
        }

        [Fact]
        public async Task Login_ReturnsOk_WhenCredentialsAreValid()
        {
            // Arrange
            var user = new LoginModel { Username = "testuser", Password = BCrypt.Net.BCrypt.HashPassword("correctpassword") };
            var users = new List<LoginModel> { user }.AsQueryable();

            _mockDbSet.As<IQueryable<LoginModel>>().Setup(m => m.Provider).Returns(users.Provider);
            _mockDbSet.As<IQueryable<LoginModel>>().Setup(m => m.Expression).Returns(users.Expression);
            _mockDbSet.As<IQueryable<LoginModel>>().Setup(m => m.ElementType).Returns(users.ElementType);
            _mockDbSet.As<IQueryable<LoginModel>>().Setup(m => m.GetEnumerator()).Returns(users.GetEnumerator());

            _mockContext.Setup(c => c.Users).Returns(_mockDbSet.Object);

            var loginRequest = new AuthController.LoginDto { Username = "testuser", Password = "correctpassword" };

            // Act
            var result = await _controller.Login(loginRequest);

            // Assert
            var okResult = Assert.IsType<OkObjectResult>(result);
            Assert.Equal(200, okResult.StatusCode);
        }
    }
}
