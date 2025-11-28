namespace bookings_api.Models;

public class Office
{
    public Guid Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string Location { get; set; } = string.Empty;
    
    public ICollection<Desk> Desks { get; set; } = new List<Desk>();
}
