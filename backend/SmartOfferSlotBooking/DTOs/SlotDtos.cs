namespace SmartOfferSlotBooking.DTOs;

public record SlotDto(
    Guid Id,
    Guid OfferId,
    string? OfferTitle,
    string SlotDate,
    string StartTime,
    string EndTime,
    int Capacity,
    int BookedCount,
    int AvailableCount,
    string Status,
    DateTime CreatedAt
);

public record CreateSlotRequest(
    Guid OfferId,
    string SlotDate,
    string StartTime,
    string EndTime,
    int Capacity,
    string Status = "Available"
);

public record UpdateSlotRequest(
    string? SlotDate,
    string? StartTime,
    string? EndTime,
    int? Capacity,
    string? Status
);
