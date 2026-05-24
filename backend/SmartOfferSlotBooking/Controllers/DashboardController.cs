using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOfferSlotBooking.Data;
using SmartOfferSlotBooking.DTOs;

namespace SmartOfferSlotBooking.Controllers;

/// <summary>Dashboard statistics</summary>
[ApiController]
[Route("api/dashboard")]
[Authorize]
[Produces("application/json")]
public class DashboardController(AppDbContext db) : ControllerBase
{
    /// <summary>Get dashboard summary statistics</summary>
    [HttpGet("summary")]
    [ProducesResponseType(typeof(DashboardSummaryDto), 200)]
    public async Task<IActionResult> Summary()
    {
        var today = DateOnly.FromDateTime(DateTime.Today);
        var todayStart = DateTime.Today;
        var todayEnd = todayStart.AddDays(1);

        var totalOffers = await db.Offers.CountAsync();
        var activeOffers = await db.Offers.CountAsync(o => o.Status == "Active");
        var totalBookings = await db.Bookings.CountAsync();
        var todaysBookings = await db.Bookings.CountAsync(b => b.CreatedAt >= todayStart && b.CreatedAt < todayEnd);

        var slots = await db.OfferSlots.ToListAsync();
        var totalCapacity = slots.Sum(s => s.Capacity);
        var bookedSeats = slots.Sum(s => s.BookedCount);
        var availableSeats = totalCapacity - bookedSeats;
        var conversionRate = totalCapacity > 0 ? Math.Round((double)bookedSeats / totalCapacity * 100, 1) : 0;

        return Ok(new DashboardSummaryDto(
            totalOffers, activeOffers, totalBookings, todaysBookings,
            totalCapacity, bookedSeats, availableSeats, conversionRate
        ));
    }
}
