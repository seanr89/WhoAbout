
using bookings_api.Data;
using bookings_api.Models;
using bookings_api.Services;
using bookings_api.Enums;
using Microsoft.EntityFrameworkCore;
using Xunit;
using System;
using System.Threading.Tasks;

namespace bookings_api_tests;

public class BookingServiceTests
{
    private AppDbContext GetDbContext()
    {
        var options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
        return new AppDbContext(options);
    }

    [Fact]
    public async Task CreateBooking_StaffWithReservedDesk_CannotDoubleBook_UnlessReleased()
    {
        // Arrange
        var context = GetDbContext();
        var service = new BookingService(context);

        var staffId = Guid.NewGuid();
        var staffMember = new StaffMember { Id = staffId, Name = "Reserved User", Email = "res@test.com" };
        var reservedDesk = new Desk { Id = 1, Name = "Desk 1", ReservedForStaffMemberId = staffId, ReservedForStaffMember = staffMember };
        var otherDesk = new Desk { Id = 2, Name = "Desk 2" }; // Not reserved

        context.StaffMembers.Add(staffMember);
        context.Desks.Add(reservedDesk);
        context.Desks.Add(otherDesk);
        await context.SaveChangesAsync();

        var bookingDate = DateTime.UtcNow.Date.AddDays(1);

        // Act & Assert
        // Try to book the OTHER desk.
        // Expected: Should fail because they already have a reserved desk for this day and it's NOT released.
        var booking = new Booking
        {
            DeskId = otherDesk.Id,
            StaffMemberId = staffId,
            BookingDate = bookingDate,
            BookingType = BookingType.FullDay
        };

        var exception = await Assert.ThrowsAsync<Exception>(() => service.CreateBookingAsync(booking));
        Assert.Equal("You have a reserved desk for this date.", exception.Message);
    }

    [Fact]
    public async Task CreateBooking_StaffWithReservedDesk_CanBookOther_IfReleased()
    {
        // Arrange
        var context = GetDbContext();
        var service = new BookingService(context);

        var staffId = Guid.NewGuid();
        var staffMember = new StaffMember { Id = staffId, Name = "Reserved User", Email = "res@test.com" };
        var reservedDesk = new Desk { Id = 1, Name = "Desk 1", ReservedForStaffMemberId = staffId, ReservedForStaffMember = staffMember };
        var otherDesk = new Desk { Id = 2, Name = "Desk 2" }; // Not reserved

        context.StaffMembers.Add(staffMember);
        context.Desks.Add(reservedDesk);
        context.Desks.Add(otherDesk);

        // Release the reserved desk for the booking date
        var bookingDate = DateTime.UtcNow.Date.AddDays(1);
        context.DeskReleases.Add(new DeskRelease { DeskId = reservedDesk.Id, Date = bookingDate });

        await context.SaveChangesAsync();

        // Act
        // Try to book the OTHER desk.
        // Expected: Should succeed because they released their reserved desk.
        var booking = new Booking
        {
            DeskId = otherDesk.Id,
            StaffMemberId = staffId,
            BookingDate = bookingDate,
            BookingType = BookingType.FullDay
        };

        var result = await service.CreateBookingAsync(booking);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(otherDesk.Id, result.DeskId);
    }

    [Fact]
    public async Task CreateBooking_OtherUser_CannotBook_ReservedDesk_IfNotReleased()
    {
        // Arrange
        var context = GetDbContext();
        var service = new BookingService(context);

        var staffOwnerId = Guid.NewGuid();
        var staffOwner = new StaffMember { Id = staffOwnerId, Name = "Owner", Email = "owner@test.com" };
        var otherUserId = Guid.NewGuid();
        var otherUser = new StaffMember { Id = otherUserId, Name = "Other", Email = "other@test.com" };

        var reservedDesk = new Desk { Id = 1, Name = "Desk 1", ReservedForStaffMemberId = staffOwnerId, ReservedForStaffMember = staffOwner };

        context.StaffMembers.Add(staffOwner);
        context.StaffMembers.Add(otherUser);
        context.Desks.Add(reservedDesk);
        await context.SaveChangesAsync();

        var bookingDate = DateTime.UtcNow.Date.AddDays(1);

        // Act & Assert
        var booking = new Booking
        {
            DeskId = reservedDesk.Id,
            StaffMemberId = otherUserId,
            BookingDate = bookingDate,
            BookingType = BookingType.FullDay
        };

        var exception = await Assert.ThrowsAsync<Exception>(() => service.CreateBookingAsync(booking));
        Assert.Equal("This desk is reserved for another staff member.", exception.Message);
    }

    [Fact]
    public async Task CreateBooking_OtherUser_CanBook_ReservedDesk_IfReleased()
    {
        // Arrange
        var context = GetDbContext();
        var service = new BookingService(context);

        var staffOwnerId = Guid.NewGuid();
        var staffOwner = new StaffMember { Id = staffOwnerId, Name = "Owner", Email = "owner@test.com" };
        var otherUserId = Guid.NewGuid();
        var otherUser = new StaffMember { Id = otherUserId, Name = "Other", Email = "other@test.com" };

        var reservedDesk = new Desk { Id = 1, Name = "Desk 1", ReservedForStaffMemberId = staffOwnerId, ReservedForStaffMember = staffOwner };

        context.StaffMembers.Add(staffOwner);
        context.StaffMembers.Add(otherUser);
        context.Desks.Add(reservedDesk);

        // Release the desk
        var bookingDate = DateTime.UtcNow.Date.AddDays(1);
        context.DeskReleases.Add(new DeskRelease { DeskId = reservedDesk.Id, Date = bookingDate });

        await context.SaveChangesAsync();

        // Act
        var booking = new Booking
        {
            DeskId = reservedDesk.Id,
            StaffMemberId = otherUserId,
            BookingDate = bookingDate,
            BookingType = BookingType.FullDay
        };

        var result = await service.CreateBookingAsync(booking);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(reservedDesk.Id, result.DeskId);
    }
}
