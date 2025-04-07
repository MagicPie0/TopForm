using NUnit.Framework;
using Moq;
using System.Threading.Tasks;
using back_end.Controllers;
using back_end.Data;
using back_end.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using BCrypt.Net;

namespace back_end.Tests
{
    public class AuthControllerTests
    {
        private AuthController _controller;
        private ApplicationDbContext _context;

        [SetUp]
        public void Setup()
        {
            // InMemory adatbázis használata
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(databaseName: "TestDb")
                .Options;

            _context = new ApplicationDbContext(options);

            // Tiszta adatbázis minden teszthez
            _context.Database.EnsureDeleted();
            _context.Database.EnsureCreated();

            _controller = new AuthController(_context);
        }

        [Test]
        public async Task Login_ReturnsBadRequest_WhenRequestIsNull()
        {
            var result = await _controller.Login(null);

            var badRequest = result as BadRequestObjectResult;
            Assert.That(badRequest, Is.Not.Null);
            Assert.That(badRequest?.StatusCode, Is.EqualTo(400));
        }

        [Test]
        public async Task Login_ReturnsNotFound_WhenUserDoesNotExist()
        {
            var loginDto = new AuthController.LoginDto
            {
                Username = "nonexistent",
                Password = "password123"
            };

            var result = await _controller.Login(loginDto);
            var notFound = result as NotFoundObjectResult;

            Assert.That(notFound, Is.Not.Null);
            Assert.That(notFound?.StatusCode, Is.EqualTo(404));
        }

        [Test]
        public async Task Login_ReturnsUnauthorized_WhenPasswordIsIncorrect()
        {
            var user = new User
            {
                Username = "testuser",
                Password = BCrypt.Net.BCrypt.HashPassword("correct_password"),
                Email = "test@example.com",          // ✅ required mező
                Name = "Test Elek",                  // ✅ required mező
                BirthDate = new DateTime(1995, 1, 1) // ha ez is required
            };


            _context.Users.Add(user); // ✅ Használjuk a helyes DbSet-et
            await _context.SaveChangesAsync();

            var loginDto = new AuthController.LoginDto
            {
                Username = "testuser",
                Password = "wrong_password"
            };

            var result = await _controller.Login(loginDto);
            var unauthorized = result as UnauthorizedObjectResult;

            Assert.That(unauthorized, Is.Not.Null);
            Assert.That(unauthorized?.StatusCode, Is.EqualTo(401));
        }



        [Test]
        public async Task Login_ReturnsOk_WithToken_WhenCredentialsAreCorrect()
        {
            var user = new User
            {
                Id = 1,
                Username = "validuser",
                Password = BCrypt.Net.BCrypt.HashPassword("validpass"),
                Email = "test@example.com",
                Name = "Tester",
                BirthDate = new DateTime(1990, 1, 1)
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            var loginDto = new AuthController.LoginDto
            {
                Username = "validuser",
                Password = "validpass"
            };

            var result = await _controller.Login(loginDto);
            var okResult = result as OkObjectResult;

            Assert.That(okResult, Is.Not.Null);
            Assert.That(okResult?.StatusCode, Is.EqualTo(200));

            dynamic response = okResult?.Value!;
            string token = response.token;
            Assert.That(token, Is.Not.Null.And.Not.Empty);
        }
    }
}
