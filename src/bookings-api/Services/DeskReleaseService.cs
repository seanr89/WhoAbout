using bookings_api.Data;
using bookings_api.Models;
using Microsoft.EntityFrameworkCore;

namespace bookings_api.Services;

public class DeskReleaseService
{
    private readonly AppDbContext _context;

    public DeskReleaseService(AppDbContext context)
    {
        _context = context;
    }

    public async Task<List<DeskRelease>> GetReleasesByDeskIdAsync(int deskId)
    {
        return await _context.DeskReleases
            .Where(r => r.DeskId == deskId && r.Date >= DateTime.UtcNow.Date)
            .OrderBy(r => r.Date)
            .ToListAsync();
    }

    public async Task<DeskRelease> CreateReleaseAsync(int deskId, DateTime date)
    {
        // Normalize date to UTC start of day
        var releaseDate = date.Date;
        if (releaseDate.Kind == DateTimeKind.Unspecified)
             releaseDate = DateTime.SpecifyKind(releaseDate, DateTimeKind.Utc);
        
        var existingRelease = await _context.DeskReleases
            .FirstOrDefaultAsync(r => r.DeskId == deskId && r.Date == releaseDate);

        if (existingRelease != null)
        {
            return existingRelease;
        }

        var release = new DeskRelease
        {
            DeskId = deskId,
            Date = releaseDate
        };

        _context.DeskReleases.Add(release);
        await _context.SaveChangesAsync();
        return release;
    }

    public async Task<bool> DeleteReleaseAsync(int deskId, DateTime date)
    {
         var releaseDate = date.Date;
        if (releaseDate.Kind == DateTimeKind.Unspecified)
             releaseDate = DateTime.SpecifyKind(releaseDate, DateTimeKind.Utc);

        var release = await _context.DeskReleases
            .FirstOrDefaultAsync(r => r.DeskId == deskId && r.Date == releaseDate);

        if (release == null)
        {
            return false;
        }

        _context.DeskReleases.Remove(release);
        await _context.SaveChangesAsync();
        return true;
    }
    
    public async Task<bool> IsDeskReleasedAsync(int deskId, DateTime date)
    {
         var releaseDate = date.Date;
        if (releaseDate.Kind == DateTimeKind.Unspecified)
             releaseDate = DateTime.SpecifyKind(releaseDate, DateTimeKind.Utc);
             
         return await _context.DeskReleases
            .AnyAsync(r => r.DeskId == deskId && r.Date == releaseDate);
    }
}
