using bookings_api.Data;
using bookings_api.Models;
using bookings_api.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace bookings_api.tests;

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
    public async Task CreateBooking_ShouldAllowReservedDesk_WhenReleased()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new BookingService(context);
        var deskReleaseService = new DeskReleaseService(context);

        var staffMember1 = new StaffMember { Id = Guid.NewGuid(), Name = "Owner" };
        var staffMember2 = new StaffMember { Id = Guid.NewGuid(), Name = "Booker" };
        var desk = new Desk { Id = 1, Name = "Reserved Desk", ReservedForStaffMemberId = staffMember1.Id };

        context.StaffMembers.AddRange(staffMember1, staffMember2);
        context.Desks.Add(desk);
        await context.SaveChangesAsync();

        var bookingDate = DateTime.UtcNow.AddDays(1).Date;

        // Release the desk
        await deskReleaseService.CreateReleaseAsync(desk.Id, bookingDate);

        var booking = new Booking
        {
            BookingDate = bookingDate,
            DeskId = desk.Id,
            StaffMemberId = staffMember2.Id,
            BookingType = bookings_api.Enums.BookingType.FullDay
        };

        // Act
        var result = await service.CreateBookingAsync(booking);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(booking.DeskId, result.DeskId);
    }

    [Fact]
    public async Task CreateBooking_ShouldPreventDoubleBooking_SameStaffMember_DifferentDesks()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new BookingService(context);

        var staffMember = new StaffMember { Id = Guid.NewGuid(), Name = "Staff" };
        var desk1 = new Desk { Id = 1, Name = "Desk 1" };
        var desk2 = new Desk { Id = 2, Name = "Desk 2" };

        context.StaffMembers.Add(staffMember);
        context.Desks.AddRange(desk1, desk2);
        await context.SaveChangesAsync();

        var bookingDate = DateTime.UtcNow.AddDays(2).Date;

        // Book first desk
        var booking1 = new Booking
        {
            BookingDate = bookingDate,
            DeskId = desk1.Id,
            StaffMemberId = staffMember.Id,
            BookingType = bookings_api.Enums.BookingType.FullDay
        };
        await service.CreateBookingAsync(booking1);

        // Attempt to book second desk on same day
        var booking2 = new Booking
        {
            BookingDate = bookingDate,
            DeskId = desk2.Id,
            StaffMemberId = staffMember.Id,
            BookingType = bookings_api.Enums.BookingType.FullDay
        };

        // Act & Assert
        // Expectation: Should throw Exception
        var exception = await Assert.ThrowsAsync<Exception>(() => service.CreateBookingAsync(booking2));
        Assert.Equal("Staff member already has a booking for this date.", exception.Message);
    }
}
