using bookings_api.Enums;

namespace bookings_api.Models;

public class StaffMember
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
    public Role Role { get; set; } = Role.Employee;
    public string? UserId { get; set; }
    
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
