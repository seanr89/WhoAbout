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
    public DbSet<StaffMember> StaffMembers { get; set; }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Office Configuration
        modelBuilder.Entity<Office>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasMany(e => e.Desks)
                  .WithOne(d => d.Office)
                  .HasForeignKey(d => d.OfficeId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Desk Configuration
        modelBuilder.Entity<Desk>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(d => d.Office)
                  .WithMany(o => o.Desks)
                  .HasForeignKey(d => d.OfficeId);
            
            entity.HasMany(d => d.Bookings)
                  .WithOne(b => b.Desk)
                  .HasForeignKey(b => b.DeskId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Booking Configuration
        modelBuilder.Entity<Booking>(entity =>
        {
            entity.HasKey(e => e.Id);
            entity.HasOne(b => b.Desk)
                  .WithMany(d => d.Bookings)
                  .HasForeignKey(b => b.DeskId);
        });

        // StaffMember Configuration
        modelBuilder.Entity<StaffMember>(entity =>
        {
            entity.HasKey(e => e.Id);
        });
    }
}
