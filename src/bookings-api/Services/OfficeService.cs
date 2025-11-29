using bookings_api.Data;
using bookings_api.Models;
using Microsoft.EntityFrameworkCore;

namespace bookings_api.Services;

public class OfficeService
{
    private readonly AppDbContext _context;

    public OfficeService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<Office>> GetAllOfficesAsync()
    {
        return await _context.Offices
            .Include(o => o.Desks)
            .ToListAsync();
    }

    public async Task<Office?> GetOfficeByIdAsync(Guid id)
    {
        return await _context.Offices
            .Include(o => o.Desks)
            .FirstOrDefaultAsync(o => o.Id == id);
    }

    public async Task<Office> CreateOfficeAsync(Office office)
    {
        _context.Offices.Add(office);
        await _context.SaveChangesAsync();
        return office;
    }

    public async Task<Office?> UpdateOfficeAsync(Guid id, Office office)
    {
        var existingOffice = await _context.Offices.FindAsync(id);
        if (existingOffice == null)
        {
            return null;
        }

        existingOffice.Name = office.Name;
        existingOffice.Location = office.Location;
        
        await _context.SaveChangesAsync();
        return existingOffice;
    }

    public async Task<bool> DeleteOfficeAsync(Guid id)
    {
        var office = await _context.Offices.FindAsync(id);
        if (office == null)
        {
            return false;
        }

        _context.Offices.Remove(office);
        await _context.SaveChangesAsync();
        return true;
    }
}
