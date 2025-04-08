using asp.Server.Controllers;
using back_end.Data;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NUnit.Framework;
using System.Security.Claims;
using System.Collections.Generic;
using System.Threading.Tasks;
using System.Linq;
using back_end.Models;
using asp.Server.Models;

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

            _context = new ApplicationDbContext(options);
            _context.Database.EnsureDeleted();
            _context.Database.EnsureCreated();

            // Seed: User
            var user = new User
            {
                Username = "testuser",
                Email = "test@example.com",
                Name = "Test Elek",
                ProfilePicture = System.Text.Encoding.UTF8.GetBytes("pic.jpg"),
                Password = "mockpassword"
            };
            _context.Users.Add(user);
            _context.SaveChanges();

            // Seed: MuscleGroup, Rank, Workout
            var muscleGroup = new MuscleGroup
            {
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

            var rank = new Ranks { rankName = "Champion", points = 500 };
            _context.Ranks.Add(rank);

            var workout = new Workouts
            {
                WorkoutDate = DateTime.Today,
                WorkoutData = "[{\"workoutDetails\":{\"exerciseName\":\"Bench Press\",\"weights\":[50,60,70]}}]"
            };
            _context.Workouts.Add(workout);
            _context.SaveChanges();

            // Seed: UserActivity
            var userActivity = new user_activity
            {
                UserId = user.Id,
                MuscleGroupId = muscleGroup.id,
                RanksID = rank.id,
                WorkoutId = workout.Id
            };
            _context.UserActivity.Add(userActivity);
            _context.SaveChanges();

            // Setup controller with claims
            _controller = new ProfileController(_context);

            var claims = new List<Claim>
            {
                new Claim("UserId", user.Id.ToString())
            };
            var identity = new ClaimsIdentity(claims, "TestAuth");
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

            dynamic profile = okResult!.Value;
            Assert.That(profile, Is.Not.Null);

            // USER
            Assert.That((string)profile.User["Name"], Is.EqualTo("Test Elek"));
            Assert.That((string)profile.User["Username"], Is.EqualTo("testuser"));
            Assert.That((string)profile.User["Email"], Is.EqualTo("test@example.com"));
            Assert.That((byte[])profile.User["ProfilePicture"], Is.EqualTo(System.Text.Encoding.UTF8.GetBytes("pic.jpg")));

            // RANK
            Assert.That((string)profile.Rank["Name"], Is.EqualTo("Champion"));
            Assert.That((int)profile.Rank["Points"], Is.EqualTo(500));

            // MUSCLES
            Assert.That((string)profile.Muscles.Groups[0].Name, Is.EqualTo("Chest"));
            Assert.That((int)profile.Muscles.Groups[0].Kg, Is.EqualTo(50));

            // WORKOUTS
            Assert.That(profile.Workouts.Count, Is.GreaterThan(0));
            Assert.That(profile.Workouts[0].Exercises.Count, Is.GreaterThan(0));
            Assert.That(profile.Workouts[0].Exercises[0].Name, Is.EqualTo("Bench Press"));
            Assert.That(profile.Workouts[0].Exercises[0].MaxWeight, Is.EqualTo(70));

        }

        [Test]
        public async Task GetProfile_ReturnsUnauthorizedWhenNoUserIdClaim()
        {
            // Arrange - simulate no user
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
            };

            // Act
            var result = await _controller.GetProfile();

            // Assert
            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var unauthorized = result as ObjectResult;
            Assert.That(unauthorized?.StatusCode, Is.EqualTo(401));
        }
    }
}
