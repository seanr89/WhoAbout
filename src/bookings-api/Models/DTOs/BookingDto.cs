using bookings_api.Enums;

namespace bookings_api.Models.DTOs;

public class BookingDto
{
    public int Id { get; set; }
    public int DeskId { get; set; }
    public Guid StaffMemberId { get; set; }
    public DateTime Date { get; set; }
    public int BookingType { get; set; }
}
