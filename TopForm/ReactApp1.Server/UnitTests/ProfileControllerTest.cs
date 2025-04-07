using asp.Server.Controllers;
using back_end.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using NUnit.Framework;
using System.Security.Claims;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using asp.Server.Models;
using back_end.Models;

namespace back_end.Tests
{
    public class ProfileControllerTests
    {
        private ApplicationDbContext _context;
        private ProfileController _controller;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "ProfileTestDb")
                .Options;

            // Clear the database before each test
            _context = new ApplicationDbContext(options);
            _context.Database.EnsureDeleted();
            _context.Database.EnsureCreated();

            // Seed data - either remove explicit IDs or ensure they're unique
            var user = new User
            {
                // Id = 1, // Either remove this or make sure it's unique
                Username = "testuser",
                Email = "test@example.com",
                Name = "Test Elek",
                ProfilePicture = System.Text.Encoding.UTF8.GetBytes("pic.jpg"),
                Password = "mockpassword"
            };
            _context.Users.Add(user);
            _context.SaveChanges(); // Save here to get the generated ID

            var muscleGroup = new MuscleGroup
            {
                // id = 1,
                name1 = "Chest",
                kg1 = 50,
                name2 = "Back",
                kg2 = 60,
                name3 = "Legs",
                kg3 = 70,
                name4 = "Shoulders",
                kg4 = 40,
                date = DateTime.Now
            };
            _context.MuscleGroups.Add(muscleGroup);

            var rank = new Ranks { /* id = 1, */ rankName = "Champion", points = 500 };
            _context.Ranks.Add(rank);

            var workout = new Workouts
            {
                // Id = 1,
                WorkoutDate = DateTime.Today,
                WorkoutData = "[{\"workoutDetails\":{\"exerciseName\":\"Bench Press\",\"weights\":[50,60,70]}}]"
            };
            _context.Workouts.Add(workout);

            _context.SaveChanges(); // Save all first to get IDs

            // Now add the user_activity with proper foreign keys
            var userActivity = new user_activity
            {
                // id = 1,
                UserId = user.Id, // Use the generated ID
                MuscleGroupId = muscleGroup.id,
                RanksID = rank.id,
                WorkoutId = workout.Id
            };
            _context.UserActivity.Add(userActivity);
            _context.SaveChanges();

            _controller = new ProfileController(_context);

            var userClaims = new List<Claim>
    {
        new Claim("UserId", user.Id.ToString()) // Use the actual user ID
    };

            var identity = new ClaimsIdentity(userClaims, "TestAuth");
            var userPrincipal = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = userPrincipal }
            };
        }

        [TearDown]
        public void TearDown()
        {
            _context?.Dispose();
        }

        [Test]
        public async Task GetProfile_ReturnsCorrectProfileForAuthorizedUser()
        {
            // Act
            var result = await _controller.GetProfile();

            // Assert
            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            var okResult = result as OkObjectResult;
            Assert.That(okResult, Is.Not.Null);

            dynamic profile = okResult.Value;
            Assert.That(profile, Is.Not.Null);

            // USER
            Assert.That(profile.User["Name"], Is.EqualTo("Test Elek"));
            Assert.That(profile.User["Username"], Is.EqualTo("testuser"));
            Assert.That(profile.User["Email"], Is.EqualTo("test@example.com"));
            Assert.That(profile.User["ProfilePicture"], Is.EqualTo("pic.jpg"));

            // RANK
            Assert.That(profile.Rank["Name"], Is.EqualTo("Champion"));
            Assert.That(profile.Rank["Points"], Is.EqualTo(500));

            // MUSCLES
            Assert.That(profile.Muscles.Groups[0].Name, Is.EqualTo("Chest"));
            Assert.That(profile.Muscles.Groups[0].Kg, Is.EqualTo(50));

            // WORKOUTS
            Assert.That(profile.workouts.Count, Is.GreaterThan(0));
            Assert.That(profile.workouts[0].Exercises.Count, Is.GreaterThan(0));
            Assert.That(profile.workouts[0].Exercises[0].Name, Is.EqualTo("Bench Press"));
            Assert.That(profile.workouts[0].Exercises[0].MaxWeight, Is.EqualTo(70));
        }
        [Test]
        public async Task GetProfile_ReturnsUnauthorizedWhenNoUserIdClaim()
        {
            // Arrange
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext() // nincs user
            };

            // Act
            var result = await _controller.GetProfile();

            // Assert
            var unauthorizedResult = result as ObjectResult;
            Assert.That(unauthorizedResult?.StatusCode, Is.EqualTo(401));
        }

    }
}
