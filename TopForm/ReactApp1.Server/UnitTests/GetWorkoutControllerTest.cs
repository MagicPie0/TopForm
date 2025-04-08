using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using Microsoft.EntityFrameworkCore;
using back_end.Controllers;
using back_end.Data;
using asp.Server.Models;
using asp.Server.Controllers;

namespace back_end.Tests
{
    public class GetWorkoutControllerTests
    {
        private ApplicationDbContext _context;
        private GetWorkoutController _controller;

        [SetUp]
        public void SetUp()
        {
            // Setup in-memory database with a unique name per test
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
                .Options;

            _context = new ApplicationDbContext(options);

            // Seed the in-memory database with data for a different date
            _context.Workouts.Add(new Workouts
            {
                Id = new Random().Next(1, 1000), // Dynamically generate a unique Id
                WorkoutDate = new DateTime(2025, 04, 01), // Seeding a workout for 2025-04-01
                WorkoutData = "[{\"workoutDetails\":{\"exerciseName\":\"Squat\",\"weights\":[60, 70, 80],\"reps\":[12, 10, 8],\"sets\":[4, 4, 4]}}]"
            });

            _context.UserActivity.Add(new user_activity
            {
                UserId = 1,
                WorkoutId = 1
            });

            _context.SaveChanges(); // Persist data

            // Create the controller with the in-memory context
            _controller = new GetWorkoutController(_context);
        }

        [TearDown]
        public void TearDown()
        {
            _context.Database.EnsureDeleted();
            _context.Dispose();
        }

        [Test]
        public async Task GetWorkoutByDate_ReturnsUnauthorized_WhenUserIdIsInvalid()
        {
            // Arrange
            SetupControllerContext(null); // No user ID set

            // Act
            var result = await _controller.GetWorkoutByDate("2025-04-01");

            // Assert
            Assert.That(result, Is.InstanceOf<UnauthorizedObjectResult>());
            var unauthorizedResult = result as UnauthorizedObjectResult;
            Assert.That(unauthorizedResult.StatusCode, Is.EqualTo(401));
            Assert.That(unauthorizedResult.Value, Is.EqualTo("Érvénytelen felhasználói azonosító."));
        }

        [Test]
        public async Task GetWorkoutByDate_ReturnsBadRequest_WhenDateIsInvalid()
        {
            // Arrange
            SetupControllerContext("1"); // Valid user ID

            // Act
            var result = await _controller.GetWorkoutByDate("invalid-date");

            // Assert
            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
            var badRequestResult = result as BadRequestObjectResult;
            Assert.That(badRequestResult.StatusCode, Is.EqualTo(400));
            Assert.That(badRequestResult.Value, Is.EqualTo("Érvénytelen dátum formátum!"));
        }

        [Test]
        public async Task GetWorkoutByDate_ReturnsNotFound_WhenNoWorkoutsFoundForDate()
        {
            // Arrange
            SetupControllerContext("1"); // Valid user ID

            // Act: Call a date that does not have any workout data
            var result = await _controller.GetWorkoutByDate("2025-05-01");  // No workout on this date

            // Assert: Ensure the result is a NotFound status with appropriate message
            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
            var notFoundResult = result as NotFoundObjectResult;
            Assert.That(notFoundResult.StatusCode, Is.EqualTo(404));
            Assert.That(notFoundResult.Value, Is.EqualTo("Nincs edzés erre a napra."));
        }
        [Test]
        public async Task GetWorkoutByDate_ReturnsOk_WhenWorkoutsFoundForDate()
        {
            // Arrange
            SetupControllerContext("1"); // Valid user ID

            // Seed data
            var workoutId = new Random().Next(1, 1000); // Dynamically generate a unique Id

            var workout = new Workouts
            {
                Id = workoutId,
                WorkoutDate = new DateTime(2025, 04, 01),
                WorkoutData = "[{\"workoutDetails\":{\"exerciseName\":\"Squat\",\"weights\":[60, 70, 80],\"reps\":[12, 10, 8],\"sets\":[4, 4, 4]}}]"
            };

            _context.Workouts.Add(workout);
            await _context.SaveChangesAsync();

            // Ensure user association
            _context.UserActivity.Add(new user_activity { UserId = 1, WorkoutId = workoutId });
            await _context.SaveChangesAsync();

            // Act
            var result = await _controller.GetWorkoutByDate("2025-04-01");

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = result as OkObjectResult;
            Assert.That(okResult?.StatusCode, Is.EqualTo(200));
        }

        private void SetupControllerContext(string userId)
        {
            var httpContext = new DefaultHttpContext();
            httpContext.User = new System.Security.Claims.ClaimsPrincipal(
                new System.Security.Claims.ClaimsIdentity(
                    new[] { new System.Security.Claims.Claim("UserId", userId ?? "") } // "UserId" nagy betűvel
                )
            );
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = httpContext
            };
        }

    }
}
