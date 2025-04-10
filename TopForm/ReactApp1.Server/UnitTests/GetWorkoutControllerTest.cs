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
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDatabase")
                .Options;

            _context = new ApplicationDbContext(options);

            _context.Workouts.Add(new Workouts
            {
                Id = new Random().Next(1, 1000),
                WorkoutDate = new DateTime(2025, 04, 01), 
                WorkoutData = "[{\"workoutDetails\":{\"exerciseName\":\"Squat\",\"weights\":[60, 70, 80],\"reps\":[12, 10, 8],\"sets\":[4, 4, 4]}}]"
            });

            _context.UserActivity.Add(new user_activity
            {
                UserId = 1,
                WorkoutId = 1
            });

            _context.SaveChanges(); 

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
            SetupControllerContext(null); 

            var result = await _controller.GetWorkoutByDate("2025-04-01");

            Assert.That(result, Is.InstanceOf<UnauthorizedObjectResult>());
            var unauthorizedResult = result as UnauthorizedObjectResult;
            Assert.That(unauthorizedResult.StatusCode, Is.EqualTo(401));
            Assert.That(unauthorizedResult.Value, Is.EqualTo("Érvénytelen felhasználói azonosító."));
        }

        [Test]
        public async Task GetWorkoutByDate_ReturnsBadRequest_WhenDateIsInvalid()
        {
            SetupControllerContext("1"); 

            var result = await _controller.GetWorkoutByDate("invalid-date");

            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
            var badRequestResult = result as BadRequestObjectResult;
            Assert.That(badRequestResult.StatusCode, Is.EqualTo(400));
            Assert.That(badRequestResult.Value, Is.EqualTo("Érvénytelen dátum formátum!"));
        }

        [Test]
        public async Task GetWorkoutByDate_ReturnsNotFound_WhenNoWorkoutsFoundForDate()
        {
            SetupControllerContext("1"); 

            var result = await _controller.GetWorkoutByDate("2025-05-01");  

            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
            var notFoundResult = result as NotFoundObjectResult;
            Assert.That(notFoundResult.StatusCode, Is.EqualTo(404));
            Assert.That(notFoundResult.Value, Is.EqualTo("Nincs edzés erre a napra."));
        }
        [Test]
        public async Task GetWorkoutByDate_ReturnsOk_WhenWorkoutsFoundForDate()
        {
            SetupControllerContext("1"); 

            var workoutId = new Random().Next(1, 1000); 

            var workout = new Workouts
            {
                Id = workoutId,
                WorkoutDate = new DateTime(2025, 04, 01),
                WorkoutData = "[{\"workoutDetails\":{\"exerciseName\":\"Squat\",\"weights\":[60, 70, 80],\"reps\":[12, 10, 8],\"sets\":[4, 4, 4]}}]"
            };

            _context.Workouts.Add(workout);
            await _context.SaveChangesAsync();

            _context.UserActivity.Add(new user_activity { UserId = 1, WorkoutId = workoutId });
            await _context.SaveChangesAsync();

            var result = await _controller.GetWorkoutByDate("2025-04-01");

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
