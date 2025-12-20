using bookings_api.Data;
using bookings_api.Models;
using bookings_api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace bookings_api_tests;

public class BookingServiceTests
{
    private AppDbContext GetInMemoryDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task CreateBookingAsync_StaffMemberWithReservedDesk_CanBookIfReleased()
    {
        // Arrange
        var context = GetInMemoryDbContext();
        var service = new BookingService(context);

        var staffMemberId = Guid.NewGuid();
        var reservedDeskId = 1;
        var targetDeskId = 2;
        var date = DateTime.UtcNow.Date;

        // Setup: Staff member has a reserved desk
        var reservedDesk = new Desk
        {
            Id = reservedDeskId,
            Name = "Reserved Desk",
            ReservedForStaffMemberId = staffMemberId
        };
        context.Desks.Add(reservedDesk);

        // Setup: Target desk available
        var targetDesk = new Desk { Id = targetDeskId, Name = "Target Desk" };
        context.Desks.Add(targetDesk);

        // Setup: Release the reserved desk for that day
        var release = new DeskRelease { DeskId = reservedDeskId, Date = date };
        context.DeskReleases.Add(release);

        await context.SaveChangesAsync();

        var booking = new Booking
        {
            DeskId = targetDeskId,
            StaffMemberId = staffMemberId,
            BookingDate = date,
            BookingType = bookings_api.Enums.BookingType.FullDay
        };

        // Act
        var result = await service.CreateBookingAsync(booking);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(targetDeskId, result.DeskId);
    }

    [Fact]
    public async Task CreateBookingAsync_StaffMemberWithReservedDesk_CannotBookIfNotReleased()
    {
        // Arrange
        var context = GetInMemoryDbContext();
        var service = new BookingService(context);

        var staffMemberId = Guid.NewGuid();
        var reservedDeskId = 1;
        var targetDeskId = 2;
        var date = DateTime.UtcNow.Date;

        // Setup: Staff member has a reserved desk
        var reservedDesk = new Desk
        {
            Id = reservedDeskId,
            Name = "Reserved Desk",
            ReservedForStaffMemberId = staffMemberId
        };
        context.Desks.Add(reservedDesk);

        // Setup: Target desk available
        var targetDesk = new Desk { Id = targetDeskId, Name = "Target Desk" };
        context.Desks.Add(targetDesk);

        // NO Release for the reserved desk

        await context.SaveChangesAsync();

        var booking = new Booking
        {
            DeskId = targetDeskId,
            StaffMemberId = staffMemberId,
            BookingDate = date,
            BookingType = bookings_api.Enums.BookingType.FullDay
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<Exception>(() => service.CreateBookingAsync(booking));
        Assert.Equal("You have a reserved desk for this date. Please release it before booking another desk.", exception.Message);
    }

    [Fact]
    public async Task CreateBookingAsync_OtherUser_CanBookReservedDesk_IfReleased()
    {
        // Arrange
        var context = GetInMemoryDbContext();
        var service = new BookingService(context);

        var ownerId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var reservedDeskId = 1;
        var date = DateTime.UtcNow.Date;

        // Setup: Desk reserved for Owner
        var reservedDesk = new Desk
        {
            Id = reservedDeskId,
            Name = "Reserved Desk",
            ReservedForStaffMemberId = ownerId
        };
        context.Desks.Add(reservedDesk);

        // Setup: Release the reserved desk for that day
        var release = new DeskRelease { DeskId = reservedDeskId, Date = date };
        context.DeskReleases.Add(release);

        await context.SaveChangesAsync();

        var booking = new Booking
        {
            DeskId = reservedDeskId,
            StaffMemberId = otherUserId, // Other user trying to book
            BookingDate = date,
            BookingType = bookings_api.Enums.BookingType.FullDay
        };

        // Act
        var result = await service.CreateBookingAsync(booking);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(reservedDeskId, result.DeskId);
        Assert.Equal(otherUserId, result.StaffMemberId);
    }

    [Fact]
    public async Task CreateBookingAsync_OtherUser_CannotBookReservedDesk_IfNotReleased()
    {
        // Arrange
        var context = GetInMemoryDbContext();
        var service = new BookingService(context);

        var ownerId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var reservedDeskId = 1;
        var date = DateTime.UtcNow.Date;

        // Setup: Desk reserved for Owner
        var reservedDesk = new Desk
        {
            Id = reservedDeskId,
            Name = "Reserved Desk",
            ReservedForStaffMemberId = ownerId
        };
        context.Desks.Add(reservedDesk);

        // NO Release

        await context.SaveChangesAsync();

        var booking = new Booking
        {
            DeskId = reservedDeskId,
            StaffMemberId = otherUserId, // Other user trying to book
            BookingDate = date,
            BookingType = bookings_api.Enums.BookingType.FullDay
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<Exception>(() => service.CreateBookingAsync(booking));
        Assert.Equal("This desk is reserved for another staff member.", exception.Message);
    }
}
