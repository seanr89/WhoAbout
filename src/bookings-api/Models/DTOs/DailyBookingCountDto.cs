namespace bookings_api.Models.DTOs;

public class DailyBookingCountDto
{
    public DateOnly Date { get; set; }
    public int Count { get; set; }
}
