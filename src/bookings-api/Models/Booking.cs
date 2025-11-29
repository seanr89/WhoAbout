namespace bookings_api.Models;

using bookings_api.Enums;

public class Booking
{
    public Guid Id { get; set; }
    public DateTime BookingDate { get; set; }
    public BookingType BookingType { get; set; }
    public BookingStatus Status { get; set; } = BookingStatus.Requested;
    
    public Guid DeskId { get; set; }
    public Desk? Desk { get; set; }
}
