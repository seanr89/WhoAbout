using bookings_api.Enums;

namespace bookings_api.Models.DTOs;

public class DeskDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public DeskType Type { get; set; }
    public Guid OfficeId { get; set; }
    public Guid? ReservedForStaffMemberId { get; set; }
}
