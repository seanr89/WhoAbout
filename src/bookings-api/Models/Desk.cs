namespace bookings_api.Models;

public class Desk
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    
    public Guid OfficeId { get; set; }
    public Office? Office { get; set; }
    
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
