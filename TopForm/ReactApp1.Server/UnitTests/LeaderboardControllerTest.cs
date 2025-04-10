using Moq;
using NUnit.Framework;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using asp.Server.Controllers;
using back_end.Data;
using back_end.Models;
using Moq.EntityFrameworkCore;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using asp.Server.Models;

namespace back_end.Tests
{
    [TestFixture]
    public class LeaderboardControllerTests
    {
        private Mock<ApplicationDbContext> _mockContext;
        private LeaderboardController _controller;

        [SetUp]
        public void SetUp()
        {
            _mockContext = new Mock<ApplicationDbContext>(new DbContextOptions<ApplicationDbContext>());

            var mockUsers = new List<User>
        {
            new User
            {
                Id = 1,
                Username = "user1",
                ProfilePicture = null,
                Email = "user1@example.com",
                Name = "User One",
                Password = "password123",
                BirthDate = new DateTime(1990, 1, 1),
                Men = 1
            },
            new User
            {
                Id = 2,
                Username = "user2",
                ProfilePicture = null,
                Email = "user2@example.com",
                Name = "User Two",
                Password = "password123",
                BirthDate = new DateTime(1992, 2, 2),
                Men = 0
            }
        };
            _mockContext.Setup(x => x.Users).ReturnsDbSet(mockUsers);

            var mockRanks = new List<Ranks>
        {
            new Ranks { id = 1, rankName = "Novice", points = 100 },
            new Ranks { id = 2, rankName = "Intermediate", points = 200 }
        };
            _mockContext.Setup(x => x.Ranks).ReturnsDbSet(mockRanks);

            var mockMuscleGroups = new List<MuscleGroup>
        {
            new MuscleGroup { id = 1, name1 = "Chest", kg1 = 50, name2 = "Back", kg2 = 60, name3 = "Legs", kg3 = 70, name4 = "Shoulders", kg4 = 80 },
            new MuscleGroup { id = 2, name1 = "Biceps", kg1 = 30, name2 = "Triceps", kg2 = 35, name3 = "Abs", kg3 = 40, name4 = "Forearms", kg4 = 45 }
        };
            _mockContext.Setup(x => x.MuscleGroups).ReturnsDbSet(mockMuscleGroups);

            var mockUserActivities = new List<user_activity>
        {
            new user_activity { UserId = 1, WorkoutId = 1, RanksID = 1, MuscleGroupId = 1 },
            new user_activity { UserId = 2, WorkoutId = 2, RanksID = 2, MuscleGroupId = 2 }
        };
            _mockContext.Setup(x => x.UserActivity).ReturnsDbSet(mockUserActivities);

            var mockWorkouts = new List<Workouts>
        {
            new Workouts { Id = 1, WorkoutData = "Push Up", WorkoutDate = DateTime.Now },
            new Workouts { Id = 2, WorkoutData = "Squats", WorkoutDate = DateTime.Now }
        };
            _mockContext.Setup(x => x.Workouts).ReturnsDbSet(mockWorkouts);

            _controller = new LeaderboardController(_mockContext.Object);
        }

        [Test]
        public async Task GetLeaderboardDetails_ReturnsOkResultWithLeaderboard()
        {
            var result = await _controller.GetLeaderboardDetails();

            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = result as OkObjectResult;
            Assert.That(okResult?.StatusCode, Is.EqualTo(200));

            var leaderboard = okResult?.Value as dynamic;
            Assert.That(leaderboard?.Leaderboard, Is.Not.Null);
            var leaderboardList = leaderboard?.Leaderboard as IEnumerable<dynamic>;

            Assert.That(leaderboardList.Count(), Is.EqualTo(2));
        }

        [Test]
        public async Task GetLeaderboardDetails_ReturnsCorrectDataForUsers()
        {
            var result = await _controller.GetLeaderboardDetails();
            var okResult = result as OkObjectResult;
            var leaderboard = okResult?.Value as dynamic;

            var leaderboardList = leaderboard?.Leaderboard as IEnumerable<dynamic>;

            var user1 = leaderboardList?.FirstOrDefault(u => u.Username == "user1");
            Assert.That(user1, Is.Not.Null);
            Assert.That(user1.Username, Is.EqualTo("user1"));
            Assert.That(user1.Rank.rankName, Is.EqualTo("Novice")); 
            Assert.That(user1.MuscleGroup.name1, Is.EqualTo("Chest"));

            var user2 = leaderboardList?.FirstOrDefault(u => u.Username == "user2");
            Assert.That(user2, Is.Not.Null);
            Assert.That(user2.Username, Is.EqualTo("user2"));
            Assert.That(user2.Rank.rankName, Is.EqualTo("Intermediate"));  
            Assert.That(user2.MuscleGroup.name1, Is.EqualTo("Biceps"));
        }


        [Test]
        public async Task GetLeaderboardDetails_EmptyUserActivity_ReturnsCorrectLeaderboard()
        {
            var emptyUserActivities = new List<user_activity>();
            _mockContext.Setup(x => x.UserActivity).ReturnsDbSet(emptyUserActivities);

            var result = await _controller.GetLeaderboardDetails();
            var okResult = result as OkObjectResult;
            var leaderboard = okResult?.Value as dynamic;

            var leaderboardList = leaderboard?.Leaderboard as IEnumerable<dynamic>;

            Assert.That(leaderboardList, Is.Not.Null);
            Assert.That(leaderboardList.Count(), Is.EqualTo(2));
        }
    }

}
