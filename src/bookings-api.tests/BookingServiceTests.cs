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

    [Fact]
    public async Task CreateBooking_ShouldPreventBooking_WhenDeskIsReservedAndNotReleased()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new BookingService(context);

        var owner = new StaffMember { Id = Guid.NewGuid(), Name = "Owner" };
        var booker = new StaffMember { Id = Guid.NewGuid(), Name = "Booker" };
        var desk = new Desk { Id = 1, Name = "Reserved Desk", ReservedForStaffMemberId = owner.Id };

        context.StaffMembers.AddRange(owner, booker);
        context.Desks.Add(desk);
        await context.SaveChangesAsync();

        var booking = new Booking
        {
            BookingDate = DateTime.UtcNow.AddDays(1).Date,
            DeskId = desk.Id,
            StaffMemberId = booker.Id,
            BookingType = bookings_api.Enums.BookingType.FullDay
        };

        // Act & Assert
        var exception = await Assert.ThrowsAsync<Exception>(() => service.CreateBookingAsync(booking));
        Assert.Equal("This desk is reserved for another staff member.", exception.Message);
    }

    [Fact]
    public async Task GetBookingsByDate_ShouldReturnBookingsForDate()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new BookingService(context);

        var date = DateTime.UtcNow.Date;
        var desk = new Desk { Id = 1, Name = "Desk 1" };
        var staff = new StaffMember { Id = Guid.NewGuid(), Name = "Staff" };

        context.Desks.Add(desk);
        context.StaffMembers.Add(staff);
        context.Bookings.Add(new Booking { BookingDate = date, DeskId = desk.Id, StaffMemberId = staff.Id });
        context.Bookings.Add(new Booking { BookingDate = date.AddDays(1), DeskId = desk.Id, StaffMemberId = staff.Id });
        await context.SaveChangesAsync();

        // Act
        var result = await service.GetBookingsByDateAsync(date);

        // Assert
        Assert.Single(result);
        Assert.Equal(date, result[0].BookingDate);
    }

    [Fact]
    public async Task GetBookingsByDateAndLocation_ShouldFilterByOffice()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new BookingService(context);

        var office1 = new Office { Id = Guid.NewGuid(), Name = "Office 1" };
        var office2 = new Office { Id = Guid.NewGuid(), Name = "Office 2" };

        var desk1 = new Desk { Id = 1, OfficeId = office1.Id };
        var desk2 = new Desk { Id = 2, OfficeId = office2.Id };

        var date = DateTime.UtcNow.Date;
        var staff = new StaffMember { Id = Guid.NewGuid(), Name = "Staff" };

        context.Offices.AddRange(office1, office2);
        context.Desks.AddRange(desk1, desk2);
        context.StaffMembers.Add(staff);

        context.Bookings.Add(new Booking { BookingDate = date, DeskId = desk1.Id, StaffMemberId = staff.Id });
        context.Bookings.Add(new Booking { BookingDate = date, DeskId = desk2.Id, StaffMemberId = staff.Id });

        await context.SaveChangesAsync();

        // Act
        var result = await service.GetBookingsByDateAndLocationAsync(date, office1.Id);

        // Assert
        Assert.Single(result);
        Assert.Equal(desk1.Id, result[0].DeskId);
    }

    [Fact]
    public async Task UpdateBooking_ShouldModifyBooking()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new BookingService(context);

        var desk = new Desk { Id = 1 };
        var staff = new StaffMember { Id = Guid.NewGuid() };
        var booking = new Booking { BookingDate = DateTime.UtcNow.Date, DeskId = desk.Id, StaffMemberId = staff.Id, BookingType = bookings_api.Enums.BookingType.FullDay };

        context.Desks.Add(desk);
        context.StaffMembers.Add(staff);
        context.Bookings.Add(booking);
        await context.SaveChangesAsync();

        var updatedBooking = new Booking {
            BookingDate = DateTime.UtcNow.Date,
            DeskId = desk.Id,
            StaffMemberId = staff.Id,
            BookingType = bookings_api.Enums.BookingType.Morning
        };

        // Act
        var result = await service.UpdateBookingAsync(booking.Id, updatedBooking);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(bookings_api.Enums.BookingType.Morning, result!.BookingType);
    }

    [Fact]
    public async Task DeleteBooking_ShouldRemoveBooking()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new BookingService(context);

        var desk = new Desk { Id = 1 };
        var staff = new StaffMember { Id = Guid.NewGuid() };
        var booking = new Booking { BookingDate = DateTime.UtcNow.Date, DeskId = desk.Id, StaffMemberId = staff.Id };

        context.Desks.Add(desk);
        context.StaffMembers.Add(staff);
        context.Bookings.Add(booking);
        await context.SaveChangesAsync();

        // Act
        var result = await service.DeleteBookingAsync(booking.Id);

        // Assert
        Assert.True(result);
        Assert.Empty(await context.Bookings.ToListAsync());
    }

    [Fact]
    public async Task GetDailyBookingCounts_ShouldReturnCorrectCounts()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new BookingService(context);

        var office = new Office { Id = Guid.NewGuid() };
        var desk = new Desk { Id = 1, OfficeId = office.Id };
        var staff = new StaffMember { Id = Guid.NewGuid() };
        var date = DateTime.UtcNow.Date;

        context.Offices.Add(office);
        context.Desks.Add(desk);
        context.StaffMembers.Add(staff);

        // 2 bookings on same date (different staff technically not possible on same desk, but for count test we can bypass validation if we seed directly)
        // Actually unique constraint is usually checked in service logic, seeding DB directly bypasses it.
        // But to be realistic let's use different desks
        var desk2 = new Desk { Id = 2, OfficeId = office.Id };
        context.Desks.Add(desk2);
        var staff2 = new StaffMember { Id = Guid.NewGuid() };
        context.StaffMembers.Add(staff2);


        context.Bookings.Add(new Booking { BookingDate = date, DeskId = desk.Id, StaffMemberId = staff.Id });
        context.Bookings.Add(new Booking { BookingDate = date, DeskId = desk2.Id, StaffMemberId = staff2.Id });
        context.Bookings.Add(new Booking { BookingDate = date.AddDays(1), DeskId = desk.Id, StaffMemberId = staff.Id });

        await context.SaveChangesAsync();

        // Act
        var result = await service.GetDailyBookingCountsAsync(office.Id, date, date.AddDays(1));

        // Assert
        Assert.Equal(2, result.Count); // 2 days
        var day1 = result.FirstOrDefault(r => r.Date == DateOnly.FromDateTime(date));
        Assert.NotNull(day1);
        Assert.Equal(2, day1!.Count);

        var day2 = result.FirstOrDefault(r => r.Date == DateOnly.FromDateTime(date.AddDays(1)));
        Assert.NotNull(day2);
        Assert.Equal(1, day2!.Count);
    }

    [Fact]
    public async Task GetBookingsByStaffMemberId_ShouldReturnBookingsForStaff()
    {
        // Arrange
        using var context = GetInMemoryDbContext();
        var service = new BookingService(context);

        var staff1 = new StaffMember { Id = Guid.NewGuid(), Name = "Staff 1" };
        var staff2 = new StaffMember { Id = Guid.NewGuid(), Name = "Staff 2" };
        var desk = new Desk { Id = 1, Name = "Desk 1" };

        context.StaffMembers.AddRange(staff1, staff2);
        context.Desks.Add(desk);
        await context.SaveChangesAsync();

        var date1 = DateTime.UtcNow.Date;
        var date2 = DateTime.UtcNow.Date.AddDays(1);

        context.Bookings.Add(new Booking { BookingDate = date1, DeskId = desk.Id, StaffMemberId = staff1.Id });
        context.Bookings.Add(new Booking { BookingDate = date2, DeskId = desk.Id, StaffMemberId = staff1.Id });
        context.Bookings.Add(new Booking { BookingDate = date1, DeskId = desk.Id, StaffMemberId = staff2.Id }); // This technically violates desk constraint but for staff query it's fine

        await context.SaveChangesAsync();

        // Act
        var result = await service.GetBookingsByStaffMemberIdAsync(staff1.Id);

        // Assert
        Assert.Equal(2, result.Count);
        Assert.All(result, b => Assert.Equal(staff1.Id, b.StaffMemberId));
    }
}
