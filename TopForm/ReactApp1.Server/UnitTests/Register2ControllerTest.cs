using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using System.Collections.Generic;
using System.Security.Claims;
using System.Threading.Tasks;
using back_end.Data;
using back_end.Controllers;
using back_end.Models;
using Microsoft.EntityFrameworkCore;
using System.Linq;
using System;
using asp.Server.Models;

namespace back_end.Tests
{
    public class Registration2ControllerTests
    {
        private ApplicationDbContext _context;
        private Registration2Controller _controller;

        [SetUp]
        public void Setup()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString()) // új DB minden teszthez
                .EnableSensitiveDataLogging()  // Aktiválja az érzékeny adatok naplózását
                .Options;

            _context = new ApplicationDbContext(options);

            // Felhasználó és aktivitás inicializálása
            _context.Users.Add(new User
            {
                Id = 1,
                Username = "tester",
                Email = "test@test.com",
                Men = 0,
                Name = "Test Elek",
                Password = "hashed-password-here"
            });

            _context.UserActivity.Add(new user_activity
            {
                id = 1,
                UserId = 1,
                MuscleGroupId = null
            });

            // Definiáljunk egy alapértelmezett MuscleGroup-ot
            _context.MuscleGroups.Add(new MuscleGroup
            {
                name1 = "Chest",
                kg1 = 50,
                name2 = "Chest Secondary",
                kg2 = 50,
                name3 = "Chest Tertiary",
                kg3 = 50,
                name4 = "Chest Quaternary",
                kg4 = 50,
                date = DateTime.Now
            });

            _context.SaveChanges();

            _controller = new Registration2Controller(_context);

            var claims = new List<Claim> { new Claim("UserId", "1") };
            var identity = new ClaimsIdentity(claims, "TestAuth");
            var user = new ClaimsPrincipal(identity);

            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext { User = user }
            };
        }


        [Test]
        public async Task UpdateUserAndAddMuscleGroups_ReturnsOk_WhenDataIsValid()
        {
            var request = new UpdateRequest
            {
                Men = 1,
                MuscleGroups = new List<MuscleGroupRequest>
        {
            new MuscleGroupRequest { Name = "Chest", Kg = 50 },
            new MuscleGroupRequest { Name = "Back", Kg = 60 },
            new MuscleGroupRequest { Name = "Legs", Kg = 70 },
            new MuscleGroupRequest { Name = "Shoulders", Kg = 40 }
        }
            };

            var result = await _controller.UpdateUserAndAddMuscleGroups(request);

            Assert.That(result, Is.InstanceOf<OkObjectResult>());

            var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == 1);
            Assert.That(user.Men, Is.EqualTo(1));

            var muscleGroup = await _context.MuscleGroups
                .OrderByDescending(mg => mg.id)
                .FirstOrDefaultAsync();

            Assert.That(muscleGroup, Is.Not.Null);
            Assert.That(muscleGroup.name1, Is.EqualTo("Chest"));
            Assert.That(muscleGroup.kg1, Is.EqualTo(50));
            Assert.That(muscleGroup.name2, Is.EqualTo("Back"));
            Assert.That(muscleGroup.kg2, Is.EqualTo(60));
            Assert.That(muscleGroup.name3, Is.EqualTo("Legs"));
            Assert.That(muscleGroup.kg3, Is.EqualTo(70));
            Assert.That(muscleGroup.name4, Is.EqualTo("Shoulders"));
            Assert.That(muscleGroup.kg4, Is.EqualTo(40));

            var userActivity = await _context.UserActivity.FirstOrDefaultAsync(ua => ua.UserId == 1);
            Assert.That(userActivity.MuscleGroupId, Is.EqualTo(muscleGroup.id));
        }

        [Test]
        public async Task UpdateUserAndAddMuscleGroups_ReturnsBadRequest_WhenNoMuscleGroups()
        {
            var request = new UpdateRequest
            {
                Men = 1,
                MuscleGroups = new List<MuscleGroupRequest>() // üres listát küldünk
            };

            var result = await _controller.UpdateUserAndAddMuscleGroups(request);

            Assert.That(result, Is.InstanceOf<BadRequestObjectResult>());
        }

        [Test]
        public async Task UpdateUserAndAddMuscleGroups_ReturnsUnauthorized_WhenNoUserClaim()
        {
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext() // nincs felhasználó claim
            };

            var request = new UpdateRequest
            {
                Men = 1,
                MuscleGroups = new List<MuscleGroupRequest>
                {
                    new MuscleGroupRequest { Name = "Chest", Kg = 50 }
                }
            };

            var result = await _controller.UpdateUserAndAddMuscleGroups(request);

            Assert.That(result, Is.InstanceOf<UnauthorizedObjectResult>());
        }

        [Test]
        public async Task UpdateUserAndAddMuscleGroups_ReturnsNotFound_WhenUserNotExists()
        {
            _controller.ControllerContext = new ControllerContext
            {
                HttpContext = new DefaultHttpContext
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new[] { new Claim("UserId", "999") }, "TestAuth"))
                }
            };

            var request = new UpdateRequest
            {
                Men = 1,
                MuscleGroups = new List<MuscleGroupRequest>
                {
                    new MuscleGroupRequest { Name = "Chest", Kg = 50 }
                }
            };

            var result = await _controller.UpdateUserAndAddMuscleGroups(request);

            Assert.That(result, Is.InstanceOf<NotFoundObjectResult>());
        }
    }
}
