using bookings_api.Data;
using bookings_api.Models;
using Microsoft.EntityFrameworkCore;

namespace bookings_api.Services;

public class DeskService
{
    private readonly AppDbContext _context;

    public DeskService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Desk>> GetAllDesksAsync()
    {
        return await _context.Desks
            .Include(d => d.Office)
            .ToListAsync();
    }

    public async Task<Desk?> GetDeskByIdAsync(int id)
    {
        return await _context.Desks
            .Include(d => d.Office)
            .Include(d => d.Bookings)
            .FirstOrDefaultAsync(d => d.Id == id);
    }

    public async Task<Desk> CreateDeskAsync(Desk desk)
    {
        _context.Desks.Add(desk);
        await _context.SaveChangesAsync();
        return desk;
    }

    public async Task<Desk?> UpdateDeskAsync(int id, Desk desk)
    {
        var existingDesk = await _context.Desks.FindAsync(id);
        if (existingDesk == null)
        {
            return null;
        }

        existingDesk.Name = desk.Name;
        existingDesk.Type = desk.Type;
        existingDesk.OfficeId = desk.OfficeId;
        existingDesk.ReservedForStaffMemberId = desk.ReservedForStaffMemberId;
        
        await _context.SaveChangesAsync();
        return existingDesk;
    }

    public async Task<bool> DeleteDeskAsync(int id)
    {
        var desk = await _context.Desks.FindAsync(id);
        if (desk == null)
        {
            return false;
        }

        _context.Desks.Remove(desk);
        await _context.SaveChangesAsync();
        return true;
    }

    public async Task<List<Desk>> GetAvailableDesksAsync(Guid officeId, DateTime date)
    {
        var targetDate = date.Date;
        if (targetDate.Kind == DateTimeKind.Unspecified)
             targetDate = DateTime.SpecifyKind(targetDate, DateTimeKind.Utc);

        var nextDay = targetDate.AddDays(1);

        // Get booked desk IDs
        var bookedDeskIds = await _context.Bookings
            .Where(b => b.BookingDate >= targetDate && b.BookingDate < nextDay
                     && b.Status != bookings_api.Enums.BookingStatus.Cancelled
                     && b.Status != bookings_api.Enums.BookingStatus.Rejected)
            .Select(b => b.DeskId)
            .ToListAsync();

        // Get released desk IDs (desks that are reserved but released for this day)
        var releasedDeskIds = await _context.DeskReleases
            .Where(r => r.Date == targetDate)
            .Select(r => r.DeskId)
            .ToListAsync();

        // Get all desks in the office
        var desks = await _context.Desks
            .Include(d => d.Office)
            .Where(d => d.OfficeId == officeId)
            .ToListAsync();

        // Filter available desks
        // A desk is available if:
        // 1. It is NOT booked.
        // 2. AND (It is NOT reserved OR It IS reserved BUT has been released).
        // Note: This logic assumes "anyone" includes the person the desk is reserved for,
        // effectively treating them as a regular user for this check if they haven't booked it yet.
        // If they have booked it, it's caught by step 1.

        var availableDesks = desks.Where(d =>
            !bookedDeskIds.Contains(d.Id) &&
            (!d.ReservedForStaffMemberId.HasValue || releasedDeskIds.Contains(d.Id))
        ).ToList();

        return availableDesks;
    }
}
