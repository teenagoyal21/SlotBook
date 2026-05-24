using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOfferSlotBooking.Data;
using SmartOfferSlotBooking.DTOs;
using SmartOfferSlotBooking.Models;

namespace SmartOfferSlotBooking.Controllers;

/// <summary>Booking management</summary>
[ApiController]
[Route("api/bookings")]
[Produces("application/json")]
public class BookingsController(AppDbContext db) : ControllerBase
{
    /// <summary>Get all bookings (admin only)</summary>
    [HttpGet]
    [Authorize]
    [ProducesResponseType(typeof(IEnumerable<BookingDto>), 200)]
    public async Task<IActionResult> GetAll()
    {
        var bookings = await db.Bookings
            .Include(b => b.Offer).ThenInclude(o => o!.Business)
            .Include(b => b.Slot)
            .OrderByDescending(b => b.CreatedAt)
            .ToListAsync();
        return Ok(bookings.Select(Map));
    }

    /// <summary>Get booking by ID</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(BookingDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Get(Guid id)
    {
        var b = await db.Bookings
            .Include(b => b.Offer).ThenInclude(o => o!.Business)
            .Include(b => b.Slot)
            .FirstOrDefaultAsync(b => b.Id == id);
        if (b == null) return NotFound();
        return Ok(Map(b));
    }

    /// <summary>Create a booking (public)</summary>
    [HttpPost]
    [ProducesResponseType(typeof(BookingDto), 201)]
    [ProducesResponseType(400)]
    public async Task<IActionResult> Create([FromBody] CreateBookingRequest req)
    {
        var slot = await db.OfferSlots
            .Include(s => s.Offer)
            .FirstOrDefaultAsync(s => s.Id == req.SlotId);

        if (slot == null) return BadRequest(new { message = "Slot not found" });
        if (slot.Status != "Available") return BadRequest(new { message = "Slot is not available" });
        if (slot.BookedCount + req.PeopleCount > slot.Capacity) return BadRequest(new { message = "Not enough seats available" });

        var offer = slot.Offer!;
        if (offer.Status != "Active") return BadRequest(new { message = "Offer is not active" });
        if (offer.EndDate < DateOnly.FromDateTime(DateTime.Today)) return BadRequest(new { message = "Offer has expired" });

        var existingCount = await db.Bookings
            .Where(b => b.OfferId == req.OfferId && b.CustomerPhone == req.CustomerPhone && b.Status != "Cancelled")
            .SumAsync(b => b.PeopleCount);
        if (existingCount + req.PeopleCount > offer.MaxBookingPerCustomer)
            return BadRequest(new { message = $"You can only book {offer.MaxBookingPerCustomer} spot(s) per customer" });

        var booking = new Booking
        {
            BookingReference = "BK" + Guid.NewGuid().ToString("N")[..8].ToUpper(),
            OfferId = req.OfferId,
            SlotId = req.SlotId,
            CustomerName = req.CustomerName,
            CustomerPhone = req.CustomerPhone,
            CustomerEmail = req.CustomerEmail,
            PeopleCount = req.PeopleCount,
            SpecialNote = req.SpecialNote,
            Status = "Confirmed",
        };
        db.Bookings.Add(booking);

        slot.BookedCount += req.PeopleCount;
        if (slot.BookedCount >= slot.Capacity) slot.Status = "Full";

        await db.SaveChangesAsync();
        await db.Entry(booking).Reference(b => b.Offer).LoadAsync();
        await db.Entry(booking.Offer!).Reference(o => o.Business).LoadAsync();
        await db.Entry(booking).Reference(b => b.Slot).LoadAsync();

        return CreatedAtAction(nameof(Get), new { id = booking.Id }, Map(booking));
    }

    /// <summary>Update booking status (admin only)</summary>
    [HttpPut("{id}/status")]
    [Authorize]
    [ProducesResponseType(typeof(BookingDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] UpdateBookingStatusRequest req)
    {
        var booking = await db.Bookings
            .Include(b => b.Offer).ThenInclude(o => o!.Business)
            .Include(b => b.Slot)
            .FirstOrDefaultAsync(b => b.Id == id);
        if (booking == null) return NotFound();
        booking.Status = req.Status;
        await db.SaveChangesAsync();
        return Ok(Map(booking));
    }

    private static BookingDto Map(Booking b) => new(
        b.Id, b.BookingReference, b.OfferId,
        b.Offer?.Title, b.Offer?.Business?.Name,
        b.SlotId, b.Slot?.SlotDate.ToString("yyyy-MM-dd"),
        b.Slot?.StartTime.ToString("HH:mm"), b.Slot?.EndTime.ToString("HH:mm"),
        b.CustomerName, b.CustomerPhone, b.CustomerEmail,
        b.PeopleCount, b.SpecialNote, b.Status, b.CreatedAt
    );
}
