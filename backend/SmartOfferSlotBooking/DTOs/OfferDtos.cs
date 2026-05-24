namespace SmartOfferSlotBooking.DTOs;

public record OfferDto(
    Guid Id,
    Guid BusinessId,
    string? BusinessName,
    string Title,
    string Description,
    string Category,
    decimal OriginalPrice,
    decimal OfferPrice,
    decimal DiscountPercentage,
    string StartDate,
    string EndDate,
    string? StartTime,
    string? EndTime,
    int TotalCapacity,
    int MaxBookingPerCustomer,
    string TermsAndConditions,
    string Status,
    DateTime CreatedAt
);

public record CreateOfferRequest(
    Guid BusinessId,
    string Title,
    string Description,
    string Category,
    decimal OriginalPrice,
    decimal OfferPrice,
    string StartDate,
    string EndDate,
    string? StartTime,
    string? EndTime,
    int TotalCapacity,
    int MaxBookingPerCustomer,
    string TermsAndConditions,
    string Status
);

public record UpdateOfferRequest(
    string? Title,
    string? Description,
    string? Category,
    decimal? OriginalPrice,
    decimal? OfferPrice,
    string? StartDate,
    string? EndDate,
    string? StartTime,
    string? EndTime,
    int? TotalCapacity,
    int? MaxBookingPerCustomer,
    string? TermsAndConditions,
    string? Status
);
