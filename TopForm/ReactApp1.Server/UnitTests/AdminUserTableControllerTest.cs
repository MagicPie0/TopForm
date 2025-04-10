using asp.Server.Admin;
using asp.Server.Models;
using back_end.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using NUnit.Framework;
using back_end.Models;
using System;
using System.Threading.Tasks;


namespace back_end.Tests
{
    [TestFixture]
    public class AdminUserTableControllerTests
    {
        private ApplicationDbContext _context;
        private AdminUserTableController _controller;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
                .Options;

            _context = new ApplicationDbContext(options);
            _controller = new AdminUserTableController(_context);

            var user = new User { Id = 1, Username = "testuser", Email = "test@example.com", Name = "Test User", Men = 0, Password = "TestPassword123" };
            _context.Users.Add(user);

            var activity = new user_activity { id = 1, UserId = 1, WorkoutId = 1, DietId = 1, RanksID = 1, MuscleGroupId = 1 };
            _context.UserActivity.Add(activity);

            var workout = new Workouts { Id = 1, WorkoutDate = DateTime.Now };
            _context.Workouts.Add(workout);

            var diet = new Diet { Id = 1, Diner = "Test Diet" };
            _context.Diet.Add(diet);

            var rank = new Ranks { id = 1, rankName = "Beginner", points = 100 };
            _context.Ranks.Add(rank);

            var muscleGroup = new MuscleGroup
            {
                id = 1,
                name1 = "Chest",
                kg1 = 10,
                kg2 = 20,
                kg3 = 30,
                kg4 = 40,
                name2 = "Shoulders",
                name3 = "Arms",
                name4 = "Legs",
                date = DateTime.Now,
            };
            _context.MuscleGroups.Add(muscleGroup);

            _context.SaveChanges();
        }

        [TearDown]
        public void TearDown()
        {
            _context.Dispose();
        }


        [Test]
        public async Task DeleteUser_ReturnsNotFound_WhenUserDoesNotExist()
        {
            var result = await _controller.DeleteUser(999);

            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
            var notFoundResult = result as NotFoundObjectResult;
            Assert.That(notFoundResult.Value, Has.Property("message").EqualTo("User not found"));
            Assert.That(notFoundResult.Value, Has.Property("status").EqualTo(404));
        }

        [Test]
        public async Task DeleteUser_ReturnsInternalServerError_WhenExceptionOccurs()
        {
            var mockSet = new Mock<DbSet<User>>();
            var mockContext = new Mock<ApplicationDbContext>(new DbContextOptions<ApplicationDbContext>());
            mockContext.Setup(c => c.Users).Returns(mockSet.Object);

            mockContext.Setup(c => c.SaveChangesAsync(It.IsAny<CancellationToken>()))
                            .ThrowsAsync(new Exception("Database failure"));

            var controller = new AdminUserTableController(mockContext.Object);

            var result = await controller.DeleteUser(1);

            Assert.That(result, Is.InstanceOf<ObjectResult>());
            var objectResult = result as ObjectResult;
            Assert.That(objectResult.StatusCode, Is.EqualTo(500));
            Assert.That(objectResult.Value, Has.Property("message").EqualTo("Something went wrong during deletion"));
            Assert.That(objectResult.Value, Has.Property("status").EqualTo(500));
        }

        [Test]
        public async Task UpdateUserByID_ReturnsNotFound_WhenUserDoesNotExist()
        {
            var updateDto = new AdminUserTableController.UserUpdateDTO
            {
                Username = "updated",
                Email = "updated@example.com",
                Name = "Updated User",
                Men = 1
            };

            var result = await _controller.UpdateUserByID(999, updateDto);

            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
            var notFoundResult = result as NotFoundObjectResult;
            Assert.That(notFoundResult.Value, Has.Property("message").EqualTo("The user was not found"));
            Assert.That(notFoundResult.Value, Has.Property("status").EqualTo(404));
        }

        [Test]
        public async Task UpdateUserByID_ReturnsOk_WhenUpdateIsSuccessful()
        {
            var updateDto = new AdminUserTableController.UserUpdateDTO
            {
                Username = "updated",
                Email = "updated@example.com",
                Name = "Updated User",
                Men = 1
            };

            var result = await _controller.UpdateUserByID(1, updateDto);

            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = result as OkObjectResult;
            Assert.That(okResult.Value, Has.Property("message").EqualTo("Update was successful"));
            Assert.That(okResult.Value, Has.Property("status").EqualTo(200));

            var updatedUser = await _context.Users.FindAsync(1);
            Assert.That(updatedUser.Username, Is.EqualTo("updated"));
            Assert.That(updatedUser.Email, Is.EqualTo("updated@example.com"));
            Assert.That(updatedUser.Name, Is.EqualTo("Updated User"));
            Assert.That(updatedUser.Men, Is.EqualTo(1));
        }


    }

}
