using bookings_api.Data;
using bookings_api.Models;
using bookings_api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace bookings_api.tests;

public class StaffMemberServiceTests
{
    private AppDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task GetAllStaffMembers_ShouldReturnAllStaff()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new StaffMemberService(context);

        context.StaffMembers.AddRange(
            new StaffMember { Id = Guid.NewGuid(), Name = "Staff 1", Email = "staff1@test.com" },
            new StaffMember { Id = Guid.NewGuid(), Name = "Staff 2", Email = "staff2@test.com" }
        );
        await context.SaveChangesAsync();

        // Act
        var result = await service.GetAllStaffMembersAsync();

        // Assert
        Assert.Equal(2, result.Count);
    }

    [Fact]
    public async Task GetStaffMemberById_ShouldReturnStaff_WhenStaffExists()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new StaffMemberService(context);
        var staffId = Guid.NewGuid();
        var staff = new StaffMember { Id = staffId, Name = "Staff 1", Email = "staff1@test.com" };

        context.StaffMembers.Add(staff);
        await context.SaveChangesAsync();

        // Act
        var result = await service.GetStaffMemberByIdAsync(staffId);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(staffId, result.Id);
        Assert.Equal("Staff 1", result.Name);
    }

    [Fact]
    public async Task CreateStaffMember_ShouldAddStaff()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new StaffMemberService(context);
        var staff = new StaffMember { Name = "New Staff", Email = "new@test.com" };

        // Act
        var result = await service.CreateStaffMemberAsync(staff);

        // Assert
        Assert.NotEqual(Guid.Empty, result.Id);
        var dbStaff = await context.StaffMembers.FindAsync(result.Id);
        Assert.NotNull(dbStaff);
        Assert.Equal("New Staff", dbStaff.Name);
    }

    [Fact]
    public async Task UpdateStaffMember_ShouldModifyStaff_WhenStaffExists()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new StaffMemberService(context);
        var staffId = Guid.NewGuid();
        var staff = new StaffMember { Id = staffId, Name = "Staff 1", Email = "staff1@test.com" };

        context.StaffMembers.Add(staff);
        await context.SaveChangesAsync();

        var updatedStaff = new StaffMember { Name = "Updated Staff", Email = "updated@test.com", IsActive = false };

        // Act
        var result = await service.UpdateStaffMemberAsync(staffId, updatedStaff);

        // Assert
        Assert.NotNull(result);
        Assert.Equal("Updated Staff", result.Name);
        Assert.False(result.IsActive);

        var dbStaff = await context.StaffMembers.FindAsync(staffId);
        Assert.Equal("Updated Staff", dbStaff.Name);
    }

    [Fact]
    public async Task DeleteStaffMember_ShouldRemoveStaff_WhenStaffExists()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new StaffMemberService(context);
        var staffId = Guid.NewGuid();
        var staff = new StaffMember { Id = staffId, Name = "Staff 1", Email = "staff1@test.com" };

        context.StaffMembers.Add(staff);
        await context.SaveChangesAsync();

        // Act
        var result = await service.DeleteStaffMemberAsync(staffId);

        // Assert
        Assert.True(result);
        var dbStaff = await context.StaffMembers.FindAsync(staffId);
        Assert.Null(dbStaff);
    }
}
