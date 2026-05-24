using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOfferSlotBooking.Data;
using SmartOfferSlotBooking.DTOs;
using SmartOfferSlotBooking.Models;

namespace SmartOfferSlotBooking.Controllers;

/// <summary>Slot management</summary>
[ApiController]
[Route("api/slots")]
[Produces("application/json")]
public class SlotsController(AppDbContext db) : ControllerBase
{
    /// <summary>Get all slots</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<SlotDto>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] Guid? offerId)
    {
        var query = db.OfferSlots.Include(s => s.Offer).AsQueryable();
        if (offerId.HasValue) query = query.Where(s => s.OfferId == offerId.Value);
        var slots = await query.OrderBy(s => s.SlotDate).ThenBy(s => s.StartTime).ToListAsync();
        return Ok(slots.Select(Map));
    }

    /// <summary>Create a new slot (admin only)</summary>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(SlotDto), 201)]
    public async Task<IActionResult> Create([FromBody] CreateSlotRequest req)
    {
        var slot = new OfferSlot
        {
            OfferId = req.OfferId,
            SlotDate = DateOnly.Parse(req.SlotDate),
            StartTime = TimeOnly.Parse(req.StartTime),
            EndTime = TimeOnly.Parse(req.EndTime),
            Capacity = req.Capacity,
            Status = req.Status,
        };
        db.OfferSlots.Add(slot);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(GetAll), new { offerId = slot.OfferId }, Map(slot));
    }

    /// <summary>Update a slot (admin only)</summary>
    [HttpPut("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(SlotDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateSlotRequest req)
    {
        var slot = await db.OfferSlots.FindAsync(id);
        if (slot == null) return NotFound();

        if (req.SlotDate != null) slot.SlotDate = DateOnly.Parse(req.SlotDate);
        if (req.StartTime != null) slot.StartTime = TimeOnly.Parse(req.StartTime);
        if (req.EndTime != null) slot.EndTime = TimeOnly.Parse(req.EndTime);
        if (req.Capacity.HasValue) slot.Capacity = req.Capacity.Value;
        if (req.Status != null) slot.Status = req.Status;

        await db.SaveChangesAsync();
        return Ok(Map(slot));
    }

    /// <summary>Delete a slot (admin only)</summary>
    [HttpDelete("{id}")]
    [Authorize]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var slot = await db.OfferSlots.FindAsync(id);
        if (slot == null) return NotFound();
        db.OfferSlots.Remove(slot);
        await db.SaveChangesAsync();
        return NoContent();
    }

    private static SlotDto Map(OfferSlot s) => new(
        s.Id, s.OfferId, s.Offer?.Title,
        s.SlotDate.ToString("yyyy-MM-dd"),
        s.StartTime.ToString("HH:mm"), s.EndTime.ToString("HH:mm"),
        s.Capacity, s.BookedCount, s.Capacity - s.BookedCount,
        s.Status, s.CreatedAt
    );
}
