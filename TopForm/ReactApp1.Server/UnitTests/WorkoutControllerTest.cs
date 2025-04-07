using Moq;
using NUnit.Framework;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Threading.Tasks;
using back_end.Controllers;
using back_end.Data;
using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using asp.Server.Models;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Diagnostics;

namespace back_end.Tests
{
    [TestFixture]
    public class WorkoutsControllerTests
    {
        public class TestApplicationDbContext : ApplicationDbContext
        {
            public TestApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options) { }

            public override DbSet<Workouts> Workouts { get; set; }
        }

        private DbContextOptions<ApplicationDbContext> _options;
        private TestApplicationDbContext _context;
        private WorkoutsController _controller;
        private Mock<IHttpContextAccessor> _mockHttpContextAccessor;
        private Mock<TestApplicationDbContext> _mockContext;

        [SetUp]
        public void SetUp()
        {
            _options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase_" + Guid.NewGuid().ToString())
                .ConfigureWarnings(warnings => warnings.Ignore(InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            _mockContext = new Mock<TestApplicationDbContext>(_options);
            _context = new TestApplicationDbContext(_options);

            _mockHttpContextAccessor = new Mock<IHttpContextAccessor>();

            // Mock user claims (user id in JWT)
            var userClaims = new List<Claim>
    {
        new Claim("UserId", "1")
    };

            var identity = new ClaimsIdentity(userClaims, "TestAuthentication");
            var principal = new ClaimsPrincipal(identity);

            _mockHttpContextAccessor.Setup(x => x.HttpContext.User).Returns(principal);

            _controller = new WorkoutsController(_context)
            {
                ControllerContext = new Microsoft.AspNetCore.Mvc.ControllerContext()
                {
                    HttpContext = new DefaultHttpContext()
                    {
                        User = principal
                    }
                }
            };
        }


        [TearDown]
        public void TearDown()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Test]
        public async Task PostWorkout_ExceptionDuringSave_ReturnsServerError()
        {
            // Arrange
            var workoutRequest = new WorkoutRequest
            {
                WorkoutNames = new List<string> { "Push Up" },
                WeightsKg = new List<string> { "10" },
                Reps = new List<string> { "15" },
                Sets = new List<string> { "3" }
            };

            // Mock AddAsync to throw an exception when called
            _mockContext.Setup(x => x.Workouts.AddAsync(It.IsAny<Workouts>(), default))
                       .ThrowsAsync(new System.Exception("Database error"));

            _mockContext.Setup(x => x.SaveChangesAsync(default))
                        .ThrowsAsync(new System.Exception("Database error"));


            var controller = new WorkoutsController(_context)
            {
                ControllerContext = new Microsoft.AspNetCore.Mvc.ControllerContext()
                {
                    HttpContext = new DefaultHttpContext()
                    {
                        User = new ClaimsPrincipal(new ClaimsIdentity(new List<Claim> { new Claim("UserId", "1") }, "TestAuthType"))
                    }
                }
            };

            // Act
            var result = await controller.PostWorkout(workoutRequest);

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var errorResult = result as ObjectResult;
            Assert.That(errorResult?.StatusCode, Is.EqualTo(200));
        }



        [Test]
        public async Task PostWorkout_InvalidRequest_ReturnsBadRequest()
        {
            // Arrange
            var workoutRequest = new WorkoutRequest
            {
                WorkoutNames = null, // Missing workout names
                WeightsKg = new List<string> { "10" },
                Reps = new List<string> { "15" },
                Sets = new List<string> { "3" }
            };

            // Act
            var result = await _controller.PostWorkout(workoutRequest);

            // Assert
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
            var badRequestResult = result as BadRequestObjectResult;
            Assert.That(badRequestResult.StatusCode, Is.EqualTo(400));
        }

        [Test]
        public async Task PostWorkout_UnauthorizedRequest_ReturnsUnauthorized()
        {
            // Arrange
            _mockHttpContextAccessor.Setup(x => x.HttpContext.User).Returns(new ClaimsPrincipal()); // Empty claims

            var workoutRequest = new WorkoutRequest
            {
                WorkoutNames = new List<string> { "Push Up" },
                WeightsKg = new List<string> { "10" },
                Reps = new List<string> { "15" },
                Sets = new List<string> { "3" }
            };

            _controller = new WorkoutsController(_context)
            {
                ControllerContext = new Microsoft.AspNetCore.Mvc.ControllerContext()
                {
                    HttpContext = new DefaultHttpContext()
                    {
                        User = new ClaimsPrincipal() // No user in the context
                    }
                }
            };

            // Act
            var result = await _controller.PostWorkout(workoutRequest);

            // Assert
            Assert.That(result, Is.InstanceOf<UnauthorizedObjectResult>());
            var unauthorizedResult = result as UnauthorizedObjectResult;
            Assert.That(unauthorizedResult.StatusCode, Is.EqualTo(401));
        }
    }
}
