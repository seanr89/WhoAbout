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

    public async Task<List<Desk>> GetAvailableDesksAsync(DateTime date, Guid officeId)
    {
        // Normalize to UTC date
        var targetDate = date.Date;
        if (targetDate.Kind == DateTimeKind.Unspecified)
             targetDate = DateTime.SpecifyKind(targetDate, DateTimeKind.Utc);

        var nextDay = targetDate.AddDays(1);

        // Get all desks in the office
        var desks = await _context.Desks
            .Where(d => d.OfficeId == officeId)
            .ToListAsync();

        // Get all bookings for the date
        var bookings = await _context.Bookings
            .Where(b => b.BookingDate >= targetDate && b.BookingDate < nextDay && b.Desk.OfficeId == officeId
                        && b.Status != bookings_api.Enums.BookingStatus.Cancelled
                        && b.Status != bookings_api.Enums.BookingStatus.Rejected)
            .Select(b => b.DeskId)
            .ToListAsync();

        // Get all releases for the date
        var releases = await _context.DeskReleases
            .Where(r => r.Date == targetDate && r.Desk.OfficeId == officeId)
            .Select(r => r.DeskId)
            .ToListAsync();

        var availableDesks = new List<Desk>();

        foreach (var desk in desks)
        {
            // If desk is already booked, skip
            if (bookings.Contains(desk.Id)) continue;

            // If desk is reserved
            if (desk.ReservedForStaffMemberId.HasValue)
            {
                // If it is NOT released, then it is NOT available (because it's reserved)
                if (!releases.Contains(desk.Id)) continue;

                // If it IS released, it IS available (unless booked, which we checked above)
            }

            availableDesks.Add(desk);
        }

        return availableDesks;
    }
}
