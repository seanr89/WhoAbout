using bookings_api.Models;

namespace bookings_api.Data;

public static class DbInitializer
{
    public static void Initialize(AppDbContext context)
    {
        Console.WriteLine("Initializing database...");
        context.Database.EnsureCreated();

        // Look for any offices.
        if (context.Offices.Any())
        {
            return;   // DB has been seeded
        }

        var offices = new Office[]
        {
            new Office { Id = Guid.NewGuid(), Name = "Headquarters", Location = "New York" },
            new Office { Id = Guid.NewGuid(), Name = "West Coast Hub", Location = "San Francisco" },
            new Office { Id = Guid.NewGuid(), Name = "European Branch", Location = "London" }
        };

        foreach (var o in offices)
        {
            context.Offices.Add(o);
        }
        context.SaveChanges();

        var desks = new Desk[]
        {
            // HQ Desks
            new Desk { Id = Guid.NewGuid(), Name = "HQ-101", OfficeId = offices[0].Id },
            new Desk { Id = Guid.NewGuid(), Name = "HQ-102", OfficeId = offices[0].Id },
            new Desk { Id = Guid.NewGuid(), Name = "HQ-103", OfficeId = offices[0].Id },
            
            // SF Desks
            new Desk { Id = Guid.NewGuid(), Name = "SF-201", OfficeId = offices[1].Id },
            new Desk { Id = Guid.NewGuid(), Name = "SF-202", OfficeId = offices[1].Id },

            // London Desks
            new Desk { Id = Guid.NewGuid(), Name = "LDN-301", OfficeId = offices[2].Id },
            new Desk { Id = Guid.NewGuid(), Name = "LDN-302", OfficeId = offices[2].Id },
            new Desk { Id = Guid.NewGuid(), Name = "LDN-303", OfficeId = offices[2].Id },
        };

        foreach (var d in desks)
        {
            context.Desks.Add(d);
        }
        context.SaveChanges();

        var bookings = new Booking[]
        {
            new Booking 
            { 
                Id = Guid.NewGuid(), 
                StartTime = DateTime.UtcNow.AddDays(1).Date.AddHours(9), 
                EndTime = DateTime.UtcNow.AddDays(1).Date.AddHours(17), 
                DeskId = desks[0].Id 
            },
            new Booking 
            { 
                Id = Guid.NewGuid(), 
                StartTime = DateTime.UtcNow.AddDays(2).Date.AddHours(9), 
                EndTime = DateTime.UtcNow.AddDays(2).Date.AddHours(12), 
                DeskId = desks[1].Id 
            },
             new Booking 
            { 
                Id = Guid.NewGuid(), 
                StartTime = DateTime.UtcNow.AddDays(1).Date.AddHours(10), 
                EndTime = DateTime.UtcNow.AddDays(1).Date.AddHours(18), 
                DeskId = desks[3].Id 
            }
        };

        foreach (var b in bookings)
        {
            context.Bookings.Add(b);
        }
        context.SaveChanges();
    }
}
