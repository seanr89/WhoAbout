using Xunit;
using Moq;
using Microsoft.EntityFrameworkCore;
using bookings_api.Services;
using bookings_api.Models;
using bookings_api.Data;
using System;
using System.Threading.Tasks;
using System.Collections.Generic;
using bookings_api.Enums;

namespace bookings_api_tests;

public class BookingServiceTests
{
    private DbContextOptions<AppDbContext> _options;

    public BookingServiceTests()
    {
        _options = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase(databaseName: Guid.NewGuid().ToString())
            .Options;
    }

    [Fact]
    public async Task CreateBookingAsync_ShouldAllowValidBooking()
    {
        using var context = new AppDbContext(_options);
        var service = new BookingService(context);

        var deskId = 1;
        var desk = new Desk { Id = deskId, Name = "D1", OfficeId = Guid.NewGuid() };
        var staffId = Guid.NewGuid();
        var staff = new StaffMember { Id = staffId, Name = "Test" };

        context.Desks.Add(desk);
        context.StaffMembers.Add(staff);
        await context.SaveChangesAsync();

        var bookingReq = new Booking
        {
            DeskId = deskId,
            StaffMemberId = staffId,
            BookingDate = DateTime.UtcNow.Date,
            BookingType = BookingType.FullDay
        };

        var booking = await service.CreateBookingAsync(bookingReq);

        Assert.NotNull(booking);
        Assert.Equal(deskId, booking.DeskId);
    }

    [Fact]
    public async Task CreateBookingAsync_ShouldPreventDoubleBooking()
    {
        using var context = new AppDbContext(_options);
        var service = new BookingService(context);

        var desk1 = new Desk { Id = 1, Name = "D1" };
        var desk2 = new Desk { Id = 2, Name = "D2" };
        var staffId = Guid.NewGuid();
        var staff = new StaffMember { Id = staffId, Name = "Test" };

        context.Desks.AddRange(desk1, desk2);
        context.StaffMembers.Add(staff);
        await context.SaveChangesAsync();

        var date = DateTime.UtcNow.Date;

        var booking1 = new Booking
        {
            DeskId = 1,
            StaffMemberId = staffId,
            BookingDate = date,
            BookingType = BookingType.FullDay
        };
        await service.CreateBookingAsync(booking1);

        var booking2 = new Booking
        {
            DeskId = 2,
            StaffMemberId = staffId,
            BookingDate = date,
            BookingType = BookingType.FullDay
        };

        await Assert.ThrowsAsync<Exception>(async () =>
        {
            await service.CreateBookingAsync(booking2);
        });
    }

    [Fact]
    public async Task CreateBookingAsync_ShouldAllowBookingReservedDesk_IfReservedForUser()
    {
        using var context = new AppDbContext(_options);
        var service = new BookingService(context);

        var staffId = Guid.NewGuid();
        var staff = new StaffMember { Id = staffId, Name = "Test" };
        var desk = new Desk { Id = 1, Name = "D1", ReservedForStaffMemberId = staffId };

        context.Desks.Add(desk);
        context.StaffMembers.Add(staff);
        await context.SaveChangesAsync();

        var bookingReq = new Booking
        {
            DeskId = 1,
            StaffMemberId = staffId,
            BookingDate = DateTime.UtcNow.Date,
            BookingType = BookingType.FullDay
        };

        var booking = await service.CreateBookingAsync(bookingReq);

        Assert.NotNull(booking);
    }

    [Fact]
    public async Task CreateBookingAsync_ShouldAllowBookingReservedDesk_IfReleased()
    {
        using var context = new AppDbContext(_options);
        var service = new BookingService(context);

        var ownerId = Guid.NewGuid();
        var otherId = Guid.NewGuid();
        var owner = new StaffMember { Id = ownerId, Name = "Owner" };
        var other = new StaffMember { Id = otherId, Name = "Other" };
        var desk = new Desk { Id = 1, Name = "D1", ReservedForStaffMemberId = ownerId };

        context.Desks.Add(desk);
        context.StaffMembers.AddRange(owner, other);

        // Add Release
        var date = DateTime.UtcNow.Date;
        context.DeskReleases.Add(new DeskRelease { DeskId = 1, Date = date });

        await context.SaveChangesAsync();

        // Should work because it is released
        var bookingReq = new Booking
        {
            DeskId = 1,
            StaffMemberId = otherId,
            BookingDate = date,
            BookingType = BookingType.FullDay
        };

        var booking = await service.CreateBookingAsync(bookingReq);

        Assert.NotNull(booking);
    }

    [Fact]
    public async Task CreateBookingAsync_ShouldPreventBookingReservedDesk_IfNotReleasedAndNotOwner()
    {
        using var context = new AppDbContext(_options);
        var service = new BookingService(context);

        var ownerId = Guid.NewGuid();
        var otherId = Guid.NewGuid();
        var owner = new StaffMember { Id = ownerId, Name = "Owner" };
        var other = new StaffMember { Id = otherId, Name = "Other" };
        var desk = new Desk { Id = 1, Name = "D1", ReservedForStaffMemberId = ownerId };

        context.Desks.Add(desk);
        context.StaffMembers.AddRange(owner, other);
        await context.SaveChangesAsync();

        // Should fail because it is reserved for owner and not released
        var bookingReq = new Booking
        {
            DeskId = 1,
            StaffMemberId = otherId,
            BookingDate = DateTime.UtcNow.Date,
            BookingType = BookingType.FullDay
        };

        await Assert.ThrowsAsync<Exception>(async () =>
        {
            await service.CreateBookingAsync(bookingReq);
        });
    }
}
