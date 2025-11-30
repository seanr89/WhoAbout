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
            new StaffMember { Id = Guid.NewGuid(), Name = "Charlie Davis", Email = "charlie.davis@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Diana Evans", Email = "diana.evans@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Ethan Foster", Email = "ethan.foster@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Fiona Green", Email = "fiona.green@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "George Harris", Email = "george.harris@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Hannah Irving", Email = "hannah.irving@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Ian Jackson", Email = "ian.jackson@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Julia King", Email = "julia.king@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Kevin Lewis", Email = "kevin.lewis@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Laura Miller", Email = "laura.miller@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Michael Nelson", Email = "michael.nelson@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Olivia Parker", Email = "olivia.parker@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Peter Quinn", Email = "peter.quinn@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Rachel Roberts", Email = "rachel.roberts@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Samuel Scott", Email = "samuel.scott@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Tina Turner", Email = "tina.turner@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Ursula Underwood", Email = "ursula.underwood@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Victor Vance", Email = "victor.vance@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Wendy White", Email = "wendy.white@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Xander Xavier", Email = "xander.xavier@example.com", IsActive = true },
            new StaffMember { Id = Guid.NewGuid(), Name = "Yvonne Young", Email = "yvonne.young@example.com", IsActive = true }
        };

        context.StaffMembers.AddRange(staffMembers);
        context.SaveChanges();

        // Reserve 5 desks in DTO office for the new staff members
        var dtoOfficeId = offices[0].Id;
        var dtoDesksForReservation = desks.Where(d => d.OfficeId == dtoOfficeId).Take(5).ToList();
        
        // Use the last 5 added staff members for reservation
        for (int i = 0; i < 5; i++)
        {
            if (i < dtoDesksForReservation.Count)
            {
                // We have 25 staff members now (15 original + 10 new). 
                // Let's pick from the newly added ones, e.g., index 15 to 19.
                var staffToReserve = staffMembers[15 + i];
                var deskToReserve = dtoDesksForReservation[i];
                
                deskToReserve.ReservedForStaffMemberId = staffToReserve.Id;
                // We need to update the desk in the context, but since 'desks' list objects are tracked (added via AddRange), 
                // modifying them here before SaveChanges might work if we hadn't already called SaveChanges for desks.
                // However, we called context.SaveChanges() for desks at line 81.
                // So we need to update them.
                context.Desks.Update(deskToReserve);
            }
        }
        context.SaveChanges();

        // Generate 35 bookings for DTO office for next 5 working days (Mon-Fri)
        var bookingList = new List<Booking>();
        
        DateTime baseDate = DateTime.UtcNow.Date;
        // Find next Monday
        int daysToMonday = ((int)DayOfWeek.Monday - (int)baseDate.DayOfWeek + 7) % 7;
        if (daysToMonday == 0) daysToMonday = 7;
        DateTime startMonday = baseDate.AddDays(daysToMonday);

        // Get DTO desks (first office)
        // dtoOfficeId is already defined above
        var dtoDesks = desks.Where(d => d.OfficeId == dtoOfficeId).ToList();

        // Create 7 bookings per day for 5 days
        for (int day = 0; day < 5; day++)
        {
            var currentDate = startMonday.AddDays(day);
            
            for (int i = 0; i < 7; i++)
            {
                // Ensure we have enough staff and desks
                if (i >= dtoDesks.Count) break;
                
                var staffIndex = (day * 7 + i) % staffMembers.Length;
                var staff = staffMembers[staffIndex];
                var desk = dtoDesks[i];

                bookingList.Add(new Booking
                {
                    Id = Guid.NewGuid(),
                    BookingDate = currentDate,
                    BookingType = BookingType.FullDay,
                    Status = BookingStatus.Requested,
                    DeskId = desk.Id,
                    StaffMemberId = staff.Id
                });
            }
        }

        context.Bookings.AddRange(bookingList);
        context.SaveChanges();
    }
}
