using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace bookings_api.Models;

public class DeskRelease
{
    public int Id { get; set; }
    
    public int DeskId { get; set; }
    public Desk Desk { get; set; } = null!;
    
    public DateTime Date { get; set; }
    
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
