using bookings_api.Data;
using bookings_api.Models;
using Microsoft.EntityFrameworkCore;

namespace bookings_api.Services;

public class BookingService
{
    private readonly AppDbContext _context;

    public BookingService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Booking>> GetAllBookingsAsync()
    {
        return await _context.Bookings
            .Include(b => b.Desk)
            .ToListAsync();
    }

    public async Task<List<Booking>> GetBookingsByDateAsync(DateTime date)
    {
        // Normalized to UTC date range
        var startOfDay = date.Date;
        if (startOfDay.Kind == DateTimeKind.Unspecified)
             startOfDay = DateTime.SpecifyKind(startOfDay, DateTimeKind.Utc);
        
        var endOfDay = startOfDay.AddDays(1);

        return await _context.Bookings
            .Include(b => b.Desk)
            .Where(b => b.BookingDate >= startOfDay && b.BookingDate < endOfDay)
            .ToListAsync();
    }

    public async Task<List<Booking>> GetBookingsByDateAndLocationAsync(DateTime date, Guid officeId)
    {
        // Normalized to UTC date range
        var startOfDay = date.Date;
        if (startOfDay.Kind == DateTimeKind.Unspecified)
             startOfDay = DateTime.SpecifyKind(startOfDay, DateTimeKind.Utc);
        
        var endOfDay = startOfDay.AddDays(1);

        return await _context.Bookings
            .Include(b => b.Desk)
            .Where(b => b.BookingDate >= startOfDay && b.BookingDate < endOfDay && b.Desk != null && b.Desk.OfficeId == officeId)
            .ToListAsync();
    }

    public async Task<Booking?> GetBookingByIdAsync(int id)
    {
        return await _context.Bookings
            .Include(b => b.Desk)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

    /// <summary>
    /// Creates a new booking.
    /// </summary>
    /// <param name="booking">The booking to create.</param>
    /// <returns>The created booking.</returns>
    public async Task<Booking> CreateBookingAsync(Booking booking)
    {
        // Check if desk exists and if it is reserved
        var desk = await _context.Desks.FindAsync(booking.DeskId);
        if (desk == null)
        {
             throw new Exception("Desk not found");
        }

        if (desk.ReservedForStaffMemberId.HasValue && desk.ReservedForStaffMemberId != booking.StaffMemberId)
        {
             // Check if the desk is released for this day
             var bookingDateRaw = booking.BookingDate.Date;
             if (bookingDateRaw.Kind == DateTimeKind.Unspecified)
                  bookingDateRaw = DateTime.SpecifyKind(bookingDateRaw, DateTimeKind.Utc);

             var isreleased = await _context.DeskReleases
                .AnyAsync(r => r.DeskId == desk.Id && r.Date == bookingDateRaw);
            
             if (!isreleased)
             {
                throw new Exception("This desk is reserved for another staff member.");
             }
        }

        // Check if staff member has a reserved desk that is not released
        var reservedDesk = await _context.Desks
            .FirstOrDefaultAsync(d => d.ReservedForStaffMemberId == booking.StaffMemberId);

        if (reservedDesk != null)
        {
             // Normalize date to UTC start of day for check
             var bookingDateRaw = booking.BookingDate.Date;
             if (bookingDateRaw.Kind == DateTimeKind.Unspecified)
                  bookingDateRaw = DateTime.SpecifyKind(bookingDateRaw, DateTimeKind.Utc);

             var isReleased = await _context.DeskReleases
                .AnyAsync(r => r.DeskId == reservedDesk.Id && r.Date == bookingDateRaw);

             if (!isReleased)
             {
                 throw new Exception("You have a reserved desk for this date. Please release it before booking another desk.");
             }
        }

        // Check for double booking overlap
        var startOfDay = booking.BookingDate.Date;
        if (startOfDay.Kind == DateTimeKind.Unspecified) 
            startOfDay = DateTime.SpecifyKind(startOfDay, DateTimeKind.Utc);
        var endOfDay = startOfDay.AddDays(1);

        // Check if staff member already has a booking for this date
        var existingStaffBooking = await _context.Bookings
            .AnyAsync(b => b.StaffMemberId == booking.StaffMemberId
                        && b.BookingDate >= startOfDay
                        && b.BookingDate < endOfDay
                        && b.Status != bookings_api.Enums.BookingStatus.Cancelled
                        && b.Status != bookings_api.Enums.BookingStatus.Rejected);

        if (existingStaffBooking)
        {
            throw new Exception("Staff member already has a booking for this date.");
        }

        var existingBookings = await _context.Bookings
            .Where(b => b.DeskId == booking.DeskId 
                     && b.BookingDate >= startOfDay 
                     && b.BookingDate < endOfDay
                     && b.Status != bookings_api.Enums.BookingStatus.Cancelled
                     && b.Status != bookings_api.Enums.BookingStatus.Rejected)
            .ToListAsync();

        foreach (var existing in existingBookings)
        {
            bool overlap = false;
            if (existing.BookingType == bookings_api.Enums.BookingType.FullDay 
                || booking.BookingType == bookings_api.Enums.BookingType.FullDay) overlap = true;
            else if (existing.BookingType == booking.BookingType) overlap = true;

            if (overlap)
            {
                throw new Exception($"Desk is already booked for {existing.BookingType} on this date.");
            }
        }

        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();
        return booking;
    }

    public async Task<Booking?> UpdateBookingAsync(int id, Booking booking)
    {
        var existingBooking = await _context.Bookings.FindAsync(id);
        if (existingBooking == null)
        {
            return null;
        }

        existingBooking.BookingDate = booking.BookingDate;
        existingBooking.BookingType = booking.BookingType;
        existingBooking.Status = booking.Status;
        existingBooking.DeskId = booking.DeskId;
        
        await _context.SaveChangesAsync();
        return existingBooking;
    }

    public async Task<bool> DeleteBookingAsync(int id)
    {
        var booking = await _context.Bookings.FindAsync(id);
        if (booking == null)
        {
            return false;
        }

        _context.Bookings.Remove(booking);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<bookings_api.Models.DTOs.DailyBookingCountDto>> GetDailyBookingCountsAsync(Guid officeId, DateTime startDate, DateTime endDate)
    {
        var counts = await _context.Bookings
            .Include(b => b.Desk)
            .Where(b => b.Desk != null && b.Desk.OfficeId == officeId && b.BookingDate >= startDate && b.BookingDate <= endDate)
            .GroupBy(b => b.BookingDate.Date)
            .Select(g => new bookings_api.Models.DTOs.DailyBookingCountDto
            {
                Date = DateOnly.FromDateTime(g.Key),
                Count = g.Count()
            })
            .ToListAsync();

        return counts;
    }

    public async Task<List<Booking>> GetBookingsByStaffMemberIdAsync(Guid staffMemberId)
    {
        return await _context.Bookings
            .Include(b => b.Desk)
            .Where(b => b.StaffMemberId == staffMemberId)
            .OrderBy(b => b.BookingDate)
            .ToListAsync();
    }
}
