namespace SmartOfferSlotBooking.Models;

public class OfferSlot
{
    public Guid Id { get; set; } = Guid.NewGuid();
    public Guid OfferId { get; set; }
    public DateOnly SlotDate { get; set; }
    public TimeOnly StartTime { get; set; }
    public TimeOnly EndTime { get; set; }
    public int Capacity { get; set; } = 10;
    public int BookedCount { get; set; } = 0;
    public string Status { get; set; } = "Available";
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Offer? Offer { get; set; }
    public ICollection<Booking> Bookings { get; set; } = new List<Booking>();
}
