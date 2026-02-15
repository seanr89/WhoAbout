using bookings_api.Data;
using bookings_api.Models;
using bookings_api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace bookings_api.tests;

public class OfficeServiceTests
{
    private AppDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetAllOffices_ShouldReturnAllOffices()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new OfficeService(context);

        context.Offices.AddRange(
            new Office { Id = Guid.NewGuid(), Name = "Office 1", Location = "Location 1" },
            new Office { Id = Guid.NewGuid(), Name = "Office 2", Location = "Location 2" }
        );
        await context.SaveChangesAsync();

        // Act
        var result = await service.GetAllOfficesAsync();

        // Assert
        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetOfficeById_ShouldReturnOffice_WhenOfficeExists()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new OfficeService(context);
        var officeId = Guid.NewGuid();
        var office = new Office { Id = officeId, Name = "Office 1", Location = "Location 1" };

        context.Offices.Add(office);
        await context.SaveChangesAsync();

        // Act
        var result = await service.GetOfficeByIdAsync(officeId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(officeId, result.Id);
        Assert.Equal("Office 1", result.Name);
    }

    [Fact]
    public async Task GetOfficeById_ShouldReturnNull_WhenOfficeDoesNotExist()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new OfficeService(context);

        // Act
        var result = await service.GetOfficeByIdAsync(Guid.NewGuid());

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public async Task CreateOffice_ShouldAddOffice()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new OfficeService(context);
        var office = new Office { Name = "New Office", Location = "New Location" };

        // Act
        var result = await service.CreateOfficeAsync(office);

        // Assert
        Assert.NotEqual(Guid.Empty, result.Id);
        var dbOffice = await context.Offices.FindAsync(result.Id);
        Assert.NotNull(dbOffice);
        Assert.Equal("New Office", dbOffice.Name);
    }

    [Fact]
    public async Task UpdateOffice_ShouldModifyOffice_WhenOfficeExists()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new OfficeService(context);
        var officeId = Guid.NewGuid();
        var office = new Office { Id = officeId, Name = "Office 1", Location = "Location 1" };

        context.Offices.Add(office);
        await context.SaveChangesAsync();

        var updatedOffice = new Office { Name = "Updated Office", Location = "Updated Location" };

        // Act
        var result = await service.UpdateOfficeAsync(officeId, updatedOffice);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Updated Office", result.Name);
        Assert.Equal("Updated Location", result.Location);

        var dbOffice = await context.Offices.FindAsync(officeId);
        Assert.Equal("Updated Office", dbOffice.Name);
    }

    [Fact]
    public async Task DeleteOffice_ShouldRemoveOffice_WhenOfficeExists()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new OfficeService(context);
        var officeId = Guid.NewGuid();
        var office = new Office { Id = officeId, Name = "Office 1", Location = "Location 1" };

        context.Offices.Add(office);
        await context.SaveChangesAsync();

        // Act
        var result = await service.DeleteOfficeAsync(officeId);

        // Assert
        Assert.True(result);
        var dbOffice = await context.Offices.FindAsync(officeId);
        Assert.Null(dbOffice);
    }
}
