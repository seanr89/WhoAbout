using bookings_api.Models;
using bookings_api.Models.DTOs;
using bookings_api.Services;
using Microsoft.AspNetCore.Mvc;

namespace bookings_api.Endpoints;

public static class BookingEndpoints
{
    public static void MapBookingEndpoints(this IEndpointRouteBuilder app)
    {
        var group = app.MapGroup("/api/bookings")
            .WithTags("Bookings")
            .WithOpenApi();

        group.MapGet("/", async (BookingService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("BookingEndpoints");
            logger.LogInformation("Getting all bookings");
            var bookings = await service.GetAllBookingsAsync();
            var dtos = bookings.Select(b => new BookingDto
            {
                Id = b.Id,
                DeskId = b.DeskId,
                StaffMemberId = b.StaffMemberId,
                Date = DateOnly.FromDateTime(b.BookingDate),
                Type = b.BookingType
            });
            return Results.Ok(dtos);
        })
        .WithName("GetAllBookings");

        group.MapGet("/{id}", async (Guid id, BookingService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("BookingEndpoints");
            logger.LogInformation("Getting booking with Id: {Id}", id);
            var booking = await service.GetBookingByIdAsync(id);
            if (booking is null)
            {
                logger.LogWarning("Booking with Id: {Id} not found", id);
                return Results.NotFound();
            }
            return Results.Ok(booking);
        })
        .WithName("GetBookingById");

        group.MapPost("/", async ([FromBody] Booking booking, BookingService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("BookingEndpoints");
            logger.LogInformation("Creating new booking for DeskId: {DeskId}", booking.DeskId);
            var createdBooking = await service.CreateBookingAsync(booking);
            return Results.Created($"/api/bookings/{createdBooking.Id}", createdBooking);
        })
        .WithName("CreateBooking");

        group.MapPut("/{id}", async (Guid id, [FromBody] Booking booking, BookingService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("BookingEndpoints");
            logger.LogInformation("Updating booking with Id: {Id}", id);
            var updatedBooking = await service.UpdateBookingAsync(id, booking);
            if (updatedBooking is null)
            {
                logger.LogWarning("Booking with Id: {Id} not found for update", id);
                return Results.NotFound();
            }
            return Results.Ok(updatedBooking);
        })
        .WithName("UpdateBooking");

        group.MapDelete("/{id}", async (Guid id, BookingService service, ILoggerFactory loggerFactory) =>
        {
            var logger = loggerFactory.CreateLogger("BookingEndpoints");
            logger.LogInformation("Deleting booking with Id: {Id}", id);
            var deleted = await service.DeleteBookingAsync(id);
            if (!deleted)
            {
                logger.LogWarning("Booking with Id: {Id} not found for deletion", id);
                return Results.NotFound();
            }
            return Results.NoContent();
        })
        .WithName("DeleteBooking");
    }
}
