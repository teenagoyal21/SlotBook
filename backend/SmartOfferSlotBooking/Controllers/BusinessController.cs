using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SmartOfferSlotBooking.Data;
using SmartOfferSlotBooking.DTOs;
using SmartOfferSlotBooking.Models;

namespace SmartOfferSlotBooking.Controllers;

/// <summary>Business profile management</summary>
[ApiController]
[Route("api/business")]
[Authorize]
[Produces("application/json")]
public class BusinessController(AppDbContext db) : ControllerBase
{
    private Guid UserId => Guid.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)!.Value);

    /// <summary>Get business profile for authenticated admin</summary>
    [HttpGet]
    [ProducesResponseType(typeof(BusinessDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Get()
    {
        var b = await db.Businesses.FirstOrDefaultAsync(x => x.AdminUserId == UserId);
        if (b == null) return NotFound();
        return Ok(Map(b));
    }

    /// <summary>Create business profile</summary>
    [HttpPost]
    [ProducesResponseType(typeof(BusinessDto), 201)]
    public async Task<IActionResult> Create([FromBody] CreateBusinessRequest req)
    {
        var business = new Business
        {
            AdminUserId = UserId,
            Name = req.Name,
            BusinessType = req.BusinessType,
            OwnerName = req.OwnerName,
            Phone = req.Phone,
            Email = req.Email,
            Address = req.Address,
            City = req.City,
            LogoUrl = req.LogoUrl,
            OpeningTime = req.OpeningTime != null ? TimeOnly.Parse(req.OpeningTime) : null,
            ClosingTime = req.ClosingTime != null ? TimeOnly.Parse(req.ClosingTime) : null,
        };
        db.Businesses.Add(business);
        await db.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), Map(business));
    }

    /// <summary>Update business profile</summary>
    [HttpPut("{id}")]
    [ProducesResponseType(typeof(BusinessDto), 200)]
    [ProducesResponseType(404)]
    public async Task<IActionResult> Update(Guid id, [FromBody] UpdateBusinessRequest req)
    {
        var b = await db.Businesses.FirstOrDefaultAsync(x => x.Id == id && x.AdminUserId == UserId);
        if (b == null) return NotFound();

        if (req.Name != null) b.Name = req.Name;
        if (req.BusinessType != null) b.BusinessType = req.BusinessType;
        if (req.OwnerName != null) b.OwnerName = req.OwnerName;
        if (req.Phone != null) b.Phone = req.Phone;
        if (req.Email != null) b.Email = req.Email;
        if (req.Address != null) b.Address = req.Address;
        if (req.City != null) b.City = req.City;
        if (req.LogoUrl != null) b.LogoUrl = req.LogoUrl;
        if (req.OpeningTime != null) b.OpeningTime = TimeOnly.Parse(req.OpeningTime);
        if (req.ClosingTime != null) b.ClosingTime = TimeOnly.Parse(req.ClosingTime);
        b.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();
        return Ok(Map(b));
    }

    private static BusinessDto Map(Business b) => new(
        b.Id, b.Name, b.BusinessType, b.OwnerName, b.Phone, b.Email,
        b.Address, b.City, b.LogoUrl,
        b.OpeningTime?.ToString("HH:mm"), b.ClosingTime?.ToString("HH:mm"), b.CreatedAt
    );
}
