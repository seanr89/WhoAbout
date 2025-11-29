namespace bookings_api.Models;

using bookings_api.Enums;

public class Booking
{
    public Guid Id { get; set; }
    public DateTime StartTime { get; set; }
    public DateTime EndTime { get; set; }
    public BookingType BookingType { get; set; }
    
    public Guid DeskId { get; set; }
    public Desk? Desk { get; set; }
}
