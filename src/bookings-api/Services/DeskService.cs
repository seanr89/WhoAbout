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
}
