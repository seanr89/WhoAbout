using bookings_api.Enums;

namespace bookings_api.Models.DTOs;

public class BookingDto
{
    public Guid Id { get; set; }
    public Guid DeskId { get; set; }
    public Guid StaffMemberId { get; set; }
    public DateOnly Date { get; set; }
    public BookingType Type { get; set; }
}
