using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOfferSlotBooking.Data;
using SmartOfferSlotBooking.DTOs;
using SmartOfferSlotBooking.Models;

namespace SmartOfferSlotBooking.Controllers;

/// <summary>Offer management</summary>
[ApiController]
[Route("api/offers")]
[Produces("application/json")]
public class OffersController(AppDbContext db) : ControllerBase
{
    /// <summary>Get all offers (public: active only, admin: all)</summary>
    [HttpGet]
    [ProducesResponseType(typeof(IEnumerable<OfferDto>), 200)]
    public async Task<IActionResult> GetAll([FromQuery] string? status, [FromQuery] Guid? businessId)
    {
        var query = db.Offers.Include(o => o.Business).AsQueryable();
        if (!User.Identity?.IsAuthenticated ?? true)
            query = query.Where(o => o.Status == "Active" && o.EndDate >= DateOnly.FromDateTime(DateTime.Today));
        if (status != null) query = query.Where(o => o.Status == status);
        if (businessId.HasValue) query = query.Where(o => o.BusinessId == businessId.Value);
        var offers = await query.OrderByDescending(o => o.CreatedAt).ToListAsync();
        return Ok(offers.Select(Map));
    }

    /// <summary>Get offer by ID</summary>
    [HttpGet("{id}")]
    [ProducesResponseType(typeof(OfferDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Get(Guid id)
    {
        var offer = await db.Offers.Include(o => o.Business).FirstOrDefaultAsync(o => o.Id == id);
        if (offer == null) return NotFound();
        return Ok(Map(offer));
    }

    /// <summary>Create offer (admin only)</summary>
    [HttpPost]
    [Authorize]
    [ProducesResponseType(typeof(OfferDto), 201)]
    public async Task<IActionResult> Create([FromBody] CreateOfferRequest req)
    {
        if (req.OfferPrice >= req.OriginalPrice)
            return BadRequest(new { message = "Offer price must be less than original price" });

        var offer = new Offer
        {
            BusinessId = req.BusinessId,
            Title = req.Title,
            Description = req.Description,
            Category = req.Category,
            OriginalPrice = req.OriginalPrice,
            OfferPrice = req.OfferPrice,
            DiscountPercentage = Math.Round((req.OriginalPrice - req.OfferPrice) / req.OriginalPrice * 100, 2),
            StartDate = DateOnly.Parse(req.StartDate),
            EndDate = DateOnly.Parse(req.EndDate),
            StartTime = req.StartTime != null ? TimeOnly.Parse(req.StartTime) : null,
            EndTime = req.EndTime != null ? TimeOnly.Parse(req.EndTime) : null,
            TotalCapacity = req.TotalCapacity,
            MaxBookingPerCustomer = req.MaxBookingPerCustomer,
            TermsAndConditions = req.TermsAndConditions,
            Status = req.Status,
        };
        db.Offers.Add(offer);
        await db.SaveChangesAsync();
        await db.Entry(offer).Reference(o => o.Business).LoadAsync();
        return CreatedAtAction(nameof(Get), new { id = offer.Id }, Map(offer));
    }

    /// <summary>Update offer (admin only)</summary>
    [HttpPut("{id}")]
    [Authorize]
    [ProducesResponseType(typeof(OfferDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateOfferRequest req)
    {
        var offer = await db.Offers.Include(o => o.Business).FirstOrDefaultAsync(o => o.Id == id);
        if (offer == null) return NotFound();

        if (req.Title != null) offer.Title = req.Title;
        if (req.Description != null) offer.Description = req.Description;
        if (req.Category != null) offer.Category = req.Category;
        if (req.OriginalPrice.HasValue) offer.OriginalPrice = req.OriginalPrice.Value;
        if (req.OfferPrice.HasValue) offer.OfferPrice = req.OfferPrice.Value;
        if (req.StartDate != null) offer.StartDate = DateOnly.Parse(req.StartDate);
        if (req.EndDate != null) offer.EndDate = DateOnly.Parse(req.EndDate);
        if (req.StartTime != null) offer.StartTime = TimeOnly.Parse(req.StartTime);
        if (req.EndTime != null) offer.EndTime = TimeOnly.Parse(req.EndTime);
        if (req.TotalCapacity.HasValue) offer.TotalCapacity = req.TotalCapacity.Value;
        if (req.MaxBookingPerCustomer.HasValue) offer.MaxBookingPerCustomer = req.MaxBookingPerCustomer.Value;
        if (req.TermsAndConditions != null) offer.TermsAndConditions = req.TermsAndConditions;
        if (req.Status != null) offer.Status = req.Status;
        offer.DiscountPercentage = Math.Round((offer.OriginalPrice - offer.OfferPrice) / offer.OriginalPrice * 100, 2);
        offer.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(Map(offer));
    }

    /// <summary>Delete offer (admin only)</summary>
    [HttpDelete("{id}")]
    [Authorize]
    [ProducesResponseType(204)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Delete(Guid id)
    {
        var offer = await db.Offers.FindAsync(id);
        if (offer == null) return NotFound();
        db.Offers.Remove(offer);
        await db.SaveChangesAsync();
        return NoContent();
    }

    /// <summary>Get slots for an offer</summary>
    [HttpGet("{offerId}/slots")]
    [ProducesResponseType(typeof(IEnumerable<SlotDto>), 200)]
    public async Task<IActionResult> GetSlots(Guid offerId)
    {
        var slots = await db.OfferSlots
            .Where(s => s.OfferId == offerId)
            .OrderBy(s => s.SlotDate).ThenBy(s => s.StartTime)
            .ToListAsync();
        return Ok(slots.Select(MapSlot));
    }

    private static OfferDto Map(Offer o) => new(
        o.Id, o.BusinessId, o.Business?.Name, o.Title, o.Description,
        o.Category, o.OriginalPrice, o.OfferPrice, o.DiscountPercentage,
        o.StartDate.ToString("yyyy-MM-dd"), o.EndDate.ToString("yyyy-MM-dd"),
        o.StartTime?.ToString("HH:mm"), o.EndTime?.ToString("HH:mm"),
        o.TotalCapacity, o.MaxBookingPerCustomer, o.TermsAndConditions, o.Status, o.CreatedAt
    );

    private static SlotDto MapSlot(OfferSlot s) => new(
        s.Id, s.OfferId, null, s.SlotDate.ToString("yyyy-MM-dd"),
        s.StartTime.ToString("HH:mm"), s.EndTime.ToString("HH:mm"),
        s.Capacity, s.BookedCount, s.Capacity - s.BookedCount, s.Status, s.CreatedAt
    );
}
