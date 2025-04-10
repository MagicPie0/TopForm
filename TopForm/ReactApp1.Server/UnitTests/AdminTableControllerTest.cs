using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using asp.Server.Admin;
using back_end.Data;
using back_end.Models;
using asp.Server.Models;
using Microsoft.EntityFrameworkCore.Query;
using System.Linq.Expressions;

namespace back_end.Tests
{
    [TestFixture]
    public class AdminControllerTests
    {
        private Mock<ApplicationDbContext> _mockContext;
        private AdminController _controller;

        [SetUp]
        public void SetUp()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .Options;

            _mockContext = new Mock<ApplicationDbContext>(options);
            _controller = new AdminController(_mockContext.Object);
        }

        [Test]
        public async Task GetUserForAdmin_ReturnsOkResult_WithUserList()
        {
            var users = new List<User> { new User { Id = 1, Username = "testUser", Password = "teszt", Email = "test@example.com", Name = "Test User" } };
            var mockSet = CreateMockDbSet(users.AsQueryable());
            _mockContext.Setup(c => c.Users).Returns(mockSet.Object);

            var result = await _controller.GetUserForAdmin();

            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = result as OkObjectResult;
            Assert.That(okResult.StatusCode, Is.EqualTo(200));
            Assert.That(okResult.Value, Is.EqualTo(users));
        }

        [Test]
        public async Task GetWorkoutForAdmin_ReturnsOkResult_WithWorkoutList()
        {
            var workouts = new List<Workouts> { new Workouts { Id = 1, WorkoutData = "Workout 1", WorkoutDate = DateTime.Now } };
            var mockSet = CreateMockDbSet(workouts.AsQueryable());
            _mockContext.Setup(c => c.Workouts).Returns(mockSet.Object);

            var result = await _controller.GetWorkoutForAdmin();

            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = result as OkObjectResult;
            Assert.That(okResult.StatusCode, Is.EqualTo(200));
            Assert.That(okResult.Value, Is.EqualTo(workouts));
        }

        [Test]
        public async Task GetDietForAdmin_ReturnsOkResult_WithDietList()
        {
            var diets = new List<Diet> { new Diet { Id = 1, Breakfast = "Pancakes", Lunch = "Chicken Salad", Diner = "Pasta", Dessert = "Ice Cream", FoodDate = DateTime.Now } };
            var mockSet = CreateMockDbSet(diets.AsQueryable());
            _mockContext.Setup(c => c.Diet).Returns(mockSet.Object);

            var result = await _controller.GetDietForAdmin();

            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = result as OkObjectResult;
            Assert.That(okResult.StatusCode, Is.EqualTo(200));
            Assert.That(okResult.Value, Is.EqualTo(diets));
        }

        [Test]
        public async Task GetMuscleGroupsForAdmin_ReturnsOkResult_WithMuscleGroupsList()
        {
            var muscleGroups = new List<MuscleGroup> { new MuscleGroup
            {
                id = 1,
                name1 = "Chest", kg1 = 100,
                name2 = "Legs", kg2 = 120,
                name3 = "Arms", kg3 = 50,
                name4 = "Back", kg4 = 200,
                date = DateTime.Now
            }};

            var mockSet = CreateMockDbSet(muscleGroups.AsQueryable());
            _mockContext.Setup(c => c.MuscleGroups).Returns(mockSet.Object);

            var result = await _controller.GetMuscleGroupsForAdmin();

            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = result as OkObjectResult;
            Assert.That(okResult.StatusCode, Is.EqualTo(200));
            Assert.That(okResult.Value, Is.EqualTo(muscleGroups));
        }

        [Test]
        public async Task GetRanksForAdmin_ReturnsOkResult_WithRanksList()
        {
            var ranks = new List<Ranks> { new Ranks { id = 1, rankName = "Rank 1", points = 1000 } };
            var mockSet = CreateMockDbSet(ranks.AsQueryable());
            _mockContext.Setup(c => c.Ranks).Returns(mockSet.Object);

            var result = await _controller.GetRanksForAdmin();

            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = result as OkObjectResult;
            Assert.That(okResult.StatusCode, Is.EqualTo(200));
            Assert.That(okResult.Value, Is.EqualTo(ranks));
        }

        [Test]
        public async Task GetUserActivityForAdmin_ReturnsOkResult_WithUserActivityList()
        {
            var userActivity = new List<user_activity> { new user_activity { id = 1, UserId = 1, RanksID = 1, DietId = 1, MuscleGroupId = 1, WorkoutId = 1 } };
            var mockSet = CreateMockDbSet(userActivity.AsQueryable());
            _mockContext.Setup(c => c.UserActivity).Returns(mockSet.Object);

            var result = await _controller.GetUserActivityForAdmin();

            Assert.That(result, Is.InstanceOf<OkObjectResult>());
            var okResult = result as OkObjectResult;
            Assert.That(okResult.StatusCode, Is.EqualTo(200));
            Assert.That(okResult.Value, Is.EqualTo(userActivity));
        }

        private static Mock<DbSet<T>> CreateMockDbSet<T>(IQueryable<T> data) where T : class
        {
            var mockSet = new Mock<DbSet<T>>();
            mockSet.As<IAsyncEnumerable<T>>()
                .Setup(m => m.GetAsyncEnumerator(It.IsAny<CancellationToken>()))
                .Returns(new TestAsyncEnumerator<T>(data.GetEnumerator()));

            mockSet.As<IQueryable<T>>()
                .Setup(m => m.Provider)
                .Returns(new TestAsyncQueryProvider<T>(data.Provider));

            mockSet.As<IQueryable<T>>()
                .Setup(m => m.Expression)
                .Returns(data.Expression);
            mockSet.As<IQueryable<T>>()
                .Setup(m => m.ElementType)
                .Returns(data.ElementType);
            mockSet.As<IQueryable<T>>()
                .Setup(m => m.GetEnumerator())
                .Returns(data.GetEnumerator());

            return mockSet;
        }
    }

    internal class TestAsyncEnumerator<T> : IAsyncEnumerator<T>
    {
        private readonly IEnumerator<T> _inner;

        public TestAsyncEnumerator(IEnumerator<T> inner)
        {
            _inner = inner;
        }

        public ValueTask DisposeAsync()
        {
            _inner.Dispose();
            return ValueTask.CompletedTask;
        }

        public ValueTask<bool> MoveNextAsync()
        {
            return ValueTask.FromResult(_inner.MoveNext());
        }

        public T Current => _inner.Current;
    }

    internal class TestAsyncQueryProvider<TEntity> : IAsyncQueryProvider
    {
        private readonly IQueryProvider _inner;

        internal TestAsyncQueryProvider(IQueryProvider inner)
        {
            _inner = inner;
        }

        public IQueryable CreateQuery(Expression expression)
        {
            return new TestAsyncEnumerable<TEntity>(expression);
        }

        public IQueryable<TElement> CreateQuery<TElement>(Expression expression)
        {
            return new TestAsyncEnumerable<TElement>(expression);
        }

        public object Execute(Expression expression)
        {
            return _inner.Execute(expression);
        }

        public TResult Execute<TResult>(Expression expression)
        {
            return _inner.Execute<TResult>(expression);
        }

        public TResult ExecuteAsync<TResult>(Expression expression, CancellationToken cancellationToken = default)
        {
            var expectedResultType = typeof(TResult).GetGenericArguments()[0];
            var executionResult = typeof(IQueryProvider)
                .GetMethod(nameof(Execute), genericParameterCount: 1, new[] { typeof(Expression) })
                .MakeGenericMethod(expectedResultType)
                .Invoke(this, new object[] { expression });

            return (TResult)typeof(Task).GetMethod(nameof(Task.FromResult))
                ?.MakeGenericMethod(expectedResultType)
                .Invoke(null, new[] { executionResult });
        }
    }

    internal class TestAsyncEnumerable<T> : EnumerableQuery<T>, IAsyncEnumerable<T>, IQueryable<T>
    {
        public TestAsyncEnumerable(IEnumerable<T> enumerable) : base(enumerable) { }
        public TestAsyncEnumerable(Expression expression) : base(expression) { }

        public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default)
        {
            return new TestAsyncEnumerator<T>(this.AsEnumerable().GetEnumerator());
        }
    }
}