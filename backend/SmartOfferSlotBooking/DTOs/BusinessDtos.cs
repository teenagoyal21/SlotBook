namespace SmartOfferSlotBooking.DTOs;

public record BusinessDto(
    Guid Id,
    string Name,
    string BusinessType,
    string OwnerName,
    string Phone,
    string Email,
    string Address,
    string City,
    string? LogoUrl,
    string? OpeningTime,
    string? ClosingTime,
    DateTime CreatedAt
);

public record CreateBusinessRequest(
    string Name,
    string BusinessType,
    string OwnerName,
    string Phone,
    string Email,
    string Address,
    string City,
    string? LogoUrl,
    string? OpeningTime,
    string? ClosingTime
);

public record UpdateBusinessRequest(
    string? Name,
    string? BusinessType,
    string? OwnerName,
    string? Phone,
    string? Email,
    string? Address,
    string? City,
    string? LogoUrl,
    string? OpeningTime,
    string? ClosingTime
);
