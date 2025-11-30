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

    public async Task<Booking?> GetBookingByIdAsync(Guid id)
    {
        return await _context.Bookings
            .Include(b => b.Desk)
            .FirstOrDefaultAsync(b => b.Id == id);
    }

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
            throw new Exception("This desk is reserved for another staff member.");
        }

        if (booking.Id == Guid.Empty)
        {
            booking.Id = Guid.NewGuid();
        }
        _context.Bookings.Add(booking);
        await _context.SaveChangesAsync();
        return booking;
    }

    public async Task<Booking?> UpdateBookingAsync(Guid id, Booking booking)
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

    public async Task<bool> DeleteBookingAsync(Guid id)
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
}
