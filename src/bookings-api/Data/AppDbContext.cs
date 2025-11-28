using bookings_api.Models;
using Microsoft.EntityFrameworkCore;

namespace bookings_api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Office> Offices { get; set; }
    public DbSet<Desk> Desks { get; set; }
    public DbSet<Booking> Bookings { get; set; }
}
