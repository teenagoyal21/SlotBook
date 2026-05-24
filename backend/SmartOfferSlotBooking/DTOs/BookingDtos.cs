namespace SmartOfferSlotBooking.DTOs;

public record BookingDto(
    Guid Id,
    string BookingReference,
    Guid OfferId,
    string? OfferTitle,
    string? BusinessName,
    Guid SlotId,
    string? SlotDate,
    string? SlotStartTime,
    string? SlotEndTime,
    string CustomerName,
    string CustomerPhone,
    string? CustomerEmail,
    int PeopleCount,
    string? SpecialNote,
    string Status,
    DateTime CreatedAt
);

public record CreateBookingRequest(
    Guid OfferId,
    Guid SlotId,
    string CustomerName,
    string CustomerPhone,
    string? CustomerEmail,
    int PeopleCount,
    string? SpecialNote
);

public record UpdateBookingStatusRequest(string Status);

public record DashboardSummaryDto(
    int TotalOffers,
    int ActiveOffers,
    int TotalBookings,
    int TodaysBookings,
    int TotalCapacity,
    int BookedSeats,
    int AvailableSeats,
    double ConversionRate
);
