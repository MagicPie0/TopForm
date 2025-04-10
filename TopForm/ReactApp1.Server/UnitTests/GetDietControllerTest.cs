using Moq;
using NUnit.Framework;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using back_end.Data;
using back_end.Controllers;
using Microsoft.AspNetCore.Http;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;
using back_end.Models;
using asp.Server.Controllers;
using asp.Server.Models;
using Moq.EntityFrameworkCore;
using System.Text.Json;

namespace back_end.Tests
{
    [TestFixture]
    public class GetDietControllerTests
    {
        private Mock<ApplicationDbContext> _mockContext;
        private GetDietController _controller;

        [SetUp]
        public void SetUp()
        {
            var mockUserActivityDbSet = new Mock<DbSet<user_activity>>();
            _mockContext = new Mock<ApplicationDbContext>(new DbContextOptions<ApplicationDbContext>());

            _mockContext.Setup(x => x.UserActivity).Returns(mockUserActivityDbSet.Object);

            var mockDietDbSet = new Mock<DbSet<Diet>>();
            _mockContext.Setup(x => x.Diet).Returns(mockDietDbSet.Object);

            _controller = new GetDietController(_mockContext.Object);

            var userClaims = new List<Claim>
            {
                new Claim("UserId", "1")
            };

            var identity = new ClaimsIdentity(userClaims, "TestAuthentication");
            var principal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new Microsoft.AspNetCore.Mvc.ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = principal
                }
            };
        }

        [Test]
        public async Task GetUserDietByDate_UnauthorizedRequest_ReturnsUnauthorized()
        {
            _controller.ControllerContext.HttpContext.User = new ClaimsPrincipal();

            var result = await _controller.GetUserDietByDate("2025-04-07");

            Assert.That(result, Is.InstanceOf<UnauthorizedObjectResult>());
            var unauthorizedResult = result as UnauthorizedObjectResult;
            Assert.That(unauthorizedResult?.StatusCode, Is.EqualTo(401));
            Assert.That(unauthorizedResult?.Value, Is.EqualTo("Érvénytelen felhasználói azonosító."));
        }

        [Test]
        public async Task GetUserDietByDate_InvalidDateFormat_ReturnsBadRequest()
        {
            var result = await _controller.GetUserDietByDate("invalid-date");

            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
            var badRequestResult = result as BadRequestObjectResult;
            Assert.That(badRequestResult?.StatusCode, Is.EqualTo(400));
            Assert.That(badRequestResult?.Value, Is.EqualTo("Érvénytelen dátum formátum!"));
        }

        [Test]
        public async Task GetUserDietByDate_NoDietFound_ReturnsNotFound()
        {
            var userDietIds = new List<int> { 1, 2 };
            _mockContext.Setup(x => x.UserActivity)
                .ReturnsDbSet(new List<user_activity> {
                    new user_activity { UserId = 1, DietId = 1 },
                    new user_activity { UserId = 1, DietId = 2 }
                });

            _mockContext.Setup(x => x.Diet)
                .ReturnsDbSet(new List<Diet> { });

            var result = await _controller.GetUserDietByDate("2025-04-07");

            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
            var notFoundResult = result as NotFoundObjectResult;
            Assert.That(notFoundResult?.StatusCode, Is.EqualTo(404));
            Assert.That(notFoundResult?.Value, Is.EqualTo("Nincs diéta erre a napra."));
        }

        [Test]
        public async Task GetUserDietByDate_ValidRequest_ReturnsOkWithDietData()
        {
            var userDietIds = new List<int> { 1, 2 };
            var mockDiets = new List<Diet>
            {
                new Diet
                {
                    Id = 1,
                    FoodDate = new DateTime(2025, 04, 07),
                    Breakfast = JsonSerializer.Serialize(new List<FoodItem> {
                        new FoodItem { Name = "Eggs", Calories = 150, Portion = "2 pieces" } }),
                    Lunch = JsonSerializer.Serialize(new List<FoodItem> {
                        new FoodItem { Name = "Chicken", Calories = 250, Portion = "200g" } }),
                    Diner = JsonSerializer.Serialize(new List<FoodItem> {
                        new FoodItem { Name = "Fish", Calories = 200, Portion = "1 fillet" } }),
                    Dessert = JsonSerializer.Serialize(new List<FoodItem> {
                        new FoodItem { Name = "Ice Cream", Calories = 300, Portion = "1 scoop" } })
                }
            };

            _mockContext.Setup(x => x.UserActivity)
                .ReturnsDbSet(new List<user_activity> {
                    new user_activity { UserId = 1, DietId = 1 }
                });

            _mockContext.Setup(x => x.Diet)
                .ReturnsDbSet(mockDiets);

            var result = await _controller.GetUserDietByDate("2025-04-07");

            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = result as OkObjectResult;
            Assert.That(okResult?.StatusCode, Is.EqualTo(200));
            var parsedDiets = okResult?.Value as IEnumerable<dynamic>;
            Assert.That(parsedDiets, Is.Not.Null);
            Assert.That(parsedDiets?.Count(), Is.EqualTo(1));
        }
    }
}
