using bookings_api.Data;
using bookings_api.Models;
using bookings_api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace bookings_api.tests;

public class DeskReleaseServiceTests
{
    private AppDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task CreateRelease_ShouldAddRelease()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new DeskReleaseService(context);
        var deskId = 1;
        var date = DateTime.UtcNow.Date;

        // Act
        var result = await service.CreateReleaseAsync(deskId, date);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(deskId, result.DeskId);
        Assert.Equal(date, result.Date);

        var dbRelease = await context.DeskReleases.FirstOrDefaultAsync(r => r.DeskId == deskId && r.Date == date);
        Assert.NotNull(dbRelease);
    }

    [Fact]
    public async Task CreateRelease_ShouldNotAddDuplicateRelease()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new DeskReleaseService(context);
        var deskId = 1;
        var date = DateTime.UtcNow.Date;

        await service.CreateReleaseAsync(deskId, date);

        // Act
        var result = await service.CreateReleaseAsync(deskId, date);

        // Assert
        // Should return existing release
        Assert.NotNull(result);
        Assert.Equal(1, await context.DeskReleases.CountAsync());
    }

    [Fact]
    public async Task IsDeskReleased_ShouldReturnTrue_WhenReleased()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new DeskReleaseService(context);
        var deskId = 1;
        var date = DateTime.UtcNow.Date;

        await service.CreateReleaseAsync(deskId, date);

        // Act
        var result = await service.IsDeskReleasedAsync(deskId, date);

        // Assert
        Assert.True(result);
    }

    [Fact]
    public async Task IsDeskReleased_ShouldReturnFalse_WhenNotReleased()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new DeskReleaseService(context);
        var deskId = 1;
        var date = DateTime.UtcNow.Date;

        // Act
        var result = await service.IsDeskReleasedAsync(deskId, date);

        // Assert
        Assert.False(result);
    }

    [Fact]
    public async Task DeleteRelease_ShouldRemoveRelease()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new DeskReleaseService(context);
        var deskId = 1;
        var date = DateTime.UtcNow.Date;

        await service.CreateReleaseAsync(deskId, date);

        // Act
        var result = await service.DeleteReleaseAsync(deskId, date);

        // Assert
        Assert.True(result);
        Assert.False(await service.IsDeskReleasedAsync(deskId, date));
    }

    [Fact]
    public async Task GetReleasesByDeskId_ShouldReturnReleases()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new DeskReleaseService(context);
        var deskId = 1;
        var date1 = DateTime.UtcNow.Date.AddDays(1);
        var date2 = DateTime.UtcNow.Date.AddDays(2);

        await service.CreateReleaseAsync(deskId, date1);
        await service.CreateReleaseAsync(deskId, date2);

        // Act
        var result = await service.GetReleasesByDeskIdAsync(deskId);

        // Assert
        Assert.Equal(2, result.Count);
        Assert.Contains(result, r => r.Date == date1);
        Assert.Contains(result, r => r.Date == date2);
    }
}
