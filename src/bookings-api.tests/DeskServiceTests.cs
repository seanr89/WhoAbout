using bookings_api.Data;
using bookings_api.Models;
using bookings_api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace bookings_api.tests;

public class DeskServiceTests
{
    private AppDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetAllDesks_ShouldReturnAllDesks()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new DeskService(context);

        var office = new Office { Id = Guid.NewGuid(), Name = "Office 1", Location = "Location 1" };
        context.Offices.Add(office);
        context.Desks.AddRange(
            new Desk { Id = 1, Name = "Desk 1", OfficeId = office.Id },
            new Desk { Id = 2, Name = "Desk 2", OfficeId = office.Id }
        );
        await context.SaveChangesAsync();

        // Act
        var result = await service.GetAllDesksAsync();

        // Assert
        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetDeskById_ShouldReturnDesk_WhenDeskExists()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new DeskService(context);

        var office = new Office { Id = Guid.NewGuid(), Name = "Office 1", Location = "Location 1" };
        var desk = new Desk { Id = 1, Name = "Desk 1", OfficeId = office.Id };

        context.Offices.Add(office);
        context.Desks.Add(desk);
        await context.SaveChangesAsync();

        // Act
        var result = await service.GetDeskByIdAsync(1);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(1, result!.Id);
        Assert.Equal("Desk 1", result.Name);
    }

    [Fact]
    public async Task GetDeskById_ShouldReturnNull_WhenDeskDoesNotExist()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new DeskService(context);

        // Act
        var result = await service.GetDeskByIdAsync(999);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task GetDesksByOfficeId_ShouldReturnDesksForSpecificOffice()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new DeskService(context);

        var office1 = new Office { Id = Guid.NewGuid(), Name = "Office 1", Location = "Location 1" };
        var office2 = new Office { Id = Guid.NewGuid(), Name = "Office 2", Location = "Location 2" };

        context.Offices.AddRange(office1, office2);
        context.Desks.AddRange(
            new Desk { Id = 1, Name = "Desk 1", OfficeId = office1.Id },
            new Desk { Id = 2, Name = "Desk 2", OfficeId = office1.Id },
            new Desk { Id = 3, Name = "Desk 3", OfficeId = office2.Id }
        );
        await context.SaveChangesAsync();

        // Act
        var result = await service.GetDesksByOfficeIdAsync(office1.Id);

        // Assert
        Assert.Equal(2, result.Count);
        Assert.All(result, d => Assert.Equal(office1.Id, d.OfficeId));
    }

    [Fact]
    public async Task CreateDesk_ShouldAddDesk()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new DeskService(context);

        var office = new Office { Id = Guid.NewGuid(), Name = "Office 1", Location = "Location 1" };
        context.Offices.Add(office);
        await context.SaveChangesAsync();

        var desk = new Desk { Name = "New Desk", OfficeId = office.Id, Type = bookings_api.Enums.DeskType.Standard };

        // Act
        var result = await service.CreateDeskAsync(desk);

        // Assert
        Assert.NotEqual(0, result.Id);
        var dbDesk = await context.Desks.FindAsync(result.Id);
        Assert.NotNull(dbDesk);
        Assert.Equal("New Desk", dbDesk!.Name);
    }

    [Fact]
    public async Task UpdateDesk_ShouldModifyDesk_WhenDeskExists()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new DeskService(context);

        var office = new Office { Id = Guid.NewGuid(), Name = "Office 1", Location = "Location 1" };
        var desk = new Desk { Id = 1, Name = "Desk 1", OfficeId = office.Id };

        context.Offices.Add(office);
        context.Desks.Add(desk);
        await context.SaveChangesAsync();

        var updatedDesk = new Desk { Name = "Updated Desk", OfficeId = office.Id, Type = bookings_api.Enums.DeskType.Standing };

        // Act
        var result = await service.UpdateDeskAsync(1, updatedDesk);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Updated Desk", result!.Name);
        Assert.Equal(bookings_api.Enums.DeskType.Standing, result.Type);

        var dbDesk = await context.Desks.FindAsync(1);
        Assert.Equal("Updated Desk", dbDesk!.Name);
    }

    [Fact]
    public async Task DeleteDesk_ShouldRemoveDesk_WhenDeskExists()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new DeskService(context);

        var office = new Office { Id = Guid.NewGuid(), Name = "Office 1", Location = "Location 1" };
        var desk = new Desk { Id = 1, Name = "Desk 1", OfficeId = office.Id };

        context.Offices.Add(office);
        context.Desks.Add(desk);
        await context.SaveChangesAsync();

        // Act
        var result = await service.DeleteDeskAsync(1);

        // Assert
        Assert.True(result);
        var dbDesk = await context.Desks.FindAsync(1);
        Assert.Null(dbDesk);
    }
}
