using NUnit.Framework;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Http;
using back_end.Controllers;
using back_end.Data;
using asp.Server.Models;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using System.Linq;
using Moq;
using System.Security.Principal;
using Moq.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;

namespace back_end.Tests
{
    [TestFixture]
    public class DietControllerTests
    {
        private DbContextOptions<ApplicationDbContext> _options;
        private ApplicationDbContext _context;
        private DietController _controller;

        [SetUp]
        public void Setup()
        {
            _options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase_" + Guid.NewGuid().ToString())
                .ConfigureWarnings(w => w.Ignore(Microsoft.EntityFrameworkCore.Diagnostics.InMemoryEventId.TransactionIgnoredWarning))
                .Options;

            _context = new ApplicationDbContext(_options);

            _controller = new DietController(_context);

            var claims = new List<Claim>
            {
                new Claim("UserId", "1")
            };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            var claimsPrincipal = new ClaimsPrincipal(identity);

            var httpContext = new DefaultHttpContext
            {
                User = claimsPrincipal
            };
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };
        }

        [TearDown]
        public void TearDown()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Test]
        public async Task PostFood_WithValidData_ReturnsOkResult()
        {
            var request = new FoodRequest
            {
                Breakfast = new List<FoodItem>
                {
                    new FoodItem { Name = "Tojás", Portion = "2 db", Calories = 180 }
                },
                Lunch = new List<FoodItem>
                {
                    new FoodItem { Name = "Csirkemell", Portion = "200g", Calories = 330 }
                },
                Diner = null,
                Dessert = null
            };

            var result = await _controller.PostFood(request);

            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = result as OkObjectResult;
            Assert.That(okResult.Value, Is.Not.Null);

            var savedDiet = await _context.Diet.FirstOrDefaultAsync();
            Assert.That(savedDiet, Is.Not.Null);

            var userActivity = await _context.UserActivity.FirstOrDefaultAsync();
            Assert.That(userActivity, Is.Not.Null);
            Assert.That(userActivity.UserId, Is.EqualTo(1));
            Assert.That(userActivity.DietId, Is.EqualTo(savedDiet.Id));
        }

        [Test]
        public async Task PostFood_WithEmptyRequest_ReturnsBadRequest()
        {
            var emptyRequest = new FoodRequest
            {
                Breakfast = null,
                Lunch = null,
                Diner = null,
                Dessert = null
            };

            var result = await _controller.PostFood(emptyRequest);

            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
            var badRequestResult = result as BadRequestObjectResult;
            Assert.That(badRequestResult.Value, Is.Not.Null);

            dynamic response = badRequestResult.Value;
            Assert.That(response.status, Is.EqualTo(400));
        }

        [Test]
        public async Task PostFood_WithNullRequest_ReturnsBadRequest()
        {
            var result = await _controller.PostFood(null);

            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
            var badRequestResult = result as BadRequestObjectResult;
            Assert.That(badRequestResult.Value, Is.Not.Null);

            dynamic response = badRequestResult.Value;
            Assert.That(response.status, Is.EqualTo(400));
        }

        [Test]
        public async Task PostFood_WithExistingUserActivity_UpdatesUserActivity()
        {
            var existingUserActivity = new user_activity
            {
                UserId = 1,
                MuscleGroupId = 2,
                DietId = null
            };
            await _context.UserActivity.AddAsync(existingUserActivity);
            await _context.SaveChangesAsync();

            var request = new FoodRequest
            {
                Breakfast = new List<FoodItem>
                {
                    new FoodItem { Name = "Zabpehely", Portion = "50g", Calories = 200 }
                }
            };

            var result = await _controller.PostFood(request);

            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            var updatedUserActivity = await _context.UserActivity.FirstOrDefaultAsync();
            Assert.That(updatedUserActivity.DietId, Is.Not.Null);
            Assert.That(updatedUserActivity.MuscleGroupId, Is.EqualTo(2));
        }

        [Test]
        public async Task PostFood_WithExistingCompleteRecord_CreatesNewActivityWithMuscleGroup()
        {
            var existingDiet = new Diet
            {
                Breakfast = "[{\"Name\":\"Kenyér\",\"Portion\":\"2 szelet\",\"Calories\":160}]",
                FoodDate = DateTime.UtcNow.AddDays(-1).Date
            };
            await _context.Diet.AddAsync(existingDiet);
            await _context.SaveChangesAsync();

            var existingComplete = new user_activity
            {
                UserId = 1,
                MuscleGroupId = 3,
                DietId = existingDiet.Id
            };
            await _context.UserActivity.AddAsync(existingComplete);
            await _context.SaveChangesAsync();

            var request = new FoodRequest
            {
                Lunch = new List<FoodItem>
                {
                    new FoodItem { Name = "Saláta", Portion = "1 tál", Calories = 150 }
                }
            };

            var result = await _controller.PostFood(request);

            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            var userActivities = await _context.UserActivity.ToListAsync();
            Assert.That(userActivities.Count, Is.EqualTo(2));

            var newActivity = userActivities.Last();
            Assert.That(newActivity.UserId, Is.EqualTo(1));
            Assert.That(newActivity.MuscleGroupId, Is.EqualTo(3));
            Assert.That(newActivity.DietId, Is.Not.EqualTo(existingDiet.Id));
        }

        [Test]
        public async Task PostFood_WithNoUserIdInToken_ReturnsUnauthorized()
        {
            var emptyClaimsPrincipal = new ClaimsPrincipal(new ClaimsIdentity());
            var controllerWithNoUser = new DietController(_context)
            {
                ControllerContext = new ControllerContext
                {
                    HttpContext = new DefaultHttpContext
                    {
                        User = emptyClaimsPrincipal
                    }
                }
            };

            var request = new FoodRequest
            {
                Breakfast = new List<FoodItem>
                {
                    new FoodItem { Name = "Joghurt", Portion = "1 pohár", Calories = 120 }
                }
            };

            var result = await controllerWithNoUser.PostFood(request);

            Assert.That(result, Is.InstanceOf<UnauthorizedObjectResult>());
            var unauthorizedResult = result as UnauthorizedObjectResult;
            Assert.That(unauthorizedResult.Value, Is.Not.Null);

            dynamic response = unauthorizedResult.Value;
            Assert.That(response.status, Is.EqualTo(401));
        }

        [Test]
        public void PostFood_ExceptionBehavior_WhenDatabaseExceptionOccurs()
        {
            var controller = new DietController(_context);
            var claims = new List<Claim> { new Claim("UserId", "1") };
            var identity = new ClaimsIdentity(claims, "TestAuthType");
            controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(identity)
                }
            };

            var request = new FoodRequest
            {
                Breakfast = new List<FoodItem>
                {
                    new FoodItem { Name = "Test", Portion = "test", Calories = 100 }
                }
            };

            Assert.DoesNotThrowAsync(async () =>
            {
                var result = await controller.PostFood(request);
                Assert.That(result, Is.InstanceOf<OkObjectResult>());
            });
        }
    }
}
