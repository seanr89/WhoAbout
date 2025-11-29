using bookings_api.Models;
using bookings_api.Enums;
using Microsoft.EntityFrameworkCore;

namespace bookings_api.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext context)
    {
        Console.WriteLine("Applying migrations...");
        context.Database.Migrate();

        // Look for any offices.
        if (context.Offices.Any())
        {
            return;   // DB has been seeded
        }

        var offices = new Office[]
        {
            new Office { Id = Guid.NewGuid(), Name = "DTO", Location = "Belfast" },
            new Office { Id = Guid.NewGuid(), Name = "Headquarters", Location = "London" },
            new Office { Id = Guid.NewGuid(), Name = "International Office", Location = "Dubai" }
        };

        foreach (var o in offices)
        {
            context.Offices.Add(o);
        }
        context.SaveChanges();

        var desks = new List<Desk>();

        // Helper to assign type based on index
        DeskType GetDeskType(int index)
        {
            if (index % 15 == 0) return DeskType.MeetingRoom;
            if (index % 5 == 0) return DeskType.HighSeat;
            if (index % 3 == 0) return DeskType.Standing;
            return DeskType.Standard;
        }

        // DTO Desks (Belfast) - 65
        for (int i = 1; i <= 65; i++)
        {
            desks.Add(new Desk 
            { 
                Id = Guid.NewGuid(), 
                Name = $"DTO-{i}", 
                OfficeId = offices[0].Id,
                Type = GetDeskType(i)
            });
        }

        // HQ Desks (London) - 40
        for (int i = 1; i <= 40; i++)
        {
            desks.Add(new Desk 
            { 
                Id = Guid.NewGuid(), 
                Name = $"HQ-{i}", 
                OfficeId = offices[1].Id,
                Type = GetDeskType(i)
            });
        }

        // International Desks (Dubai) - 20
        for (int i = 1; i <= 20; i++)
        {
            desks.Add(new Desk 
            { 
                Id = Guid.NewGuid(), 
                Name = $"INT-{i}", 
                OfficeId = offices[2].Id,
                Type = GetDeskType(i)
            });
        }

        context.Desks.AddRange(desks);
        context.SaveChanges();

        var staffMembers = new StaffMember[]
        {
            new StaffMember { Id = Guid.NewGuid(), Name = "John Doe", Email = "john.doe@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Jane Smith", Email = "jane.smith@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Alice Johnson", Email = "alice.johnson@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Bob Brown", Email = "bob.brown@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Charlie Davis", Email = "charlie.davis@example.com", IsActive = true }
        };

        context.StaffMembers.AddRange(staffMembers);
        context.SaveChanges();

        var bookings = new Booking[]
        {
            new Booking 
            { 
                Id = Guid.NewGuid(), 
                BookingDate = DateTime.UtcNow.AddDays(1).Date,
                BookingType = BookingType.FullDay,
                Status = BookingStatus.Accepted,
                DeskId = desks[0].Id // DTO Desk
            },
            new Booking 
            { 
                Id = Guid.NewGuid(), 
                BookingDate = DateTime.UtcNow.AddDays(2).Date,
                BookingType = BookingType.Morning,
                Status = BookingStatus.Requested,
                DeskId = desks[65].Id // HQ Desk
            },
             new Booking 
            { 
                Id = Guid.NewGuid(), 
                BookingDate = DateTime.UtcNow.AddDays(1).Date,
                BookingType = BookingType.FullDay,
                Status = BookingStatus.Accepted,
                DeskId = desks[105].Id // INT Desk
            }
        };

        foreach (var b in bookings)
        {
            context.Bookings.Add(b);
        }
        context.SaveChanges();
    }
}
