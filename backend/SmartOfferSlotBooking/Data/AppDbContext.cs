using Microsoft.EntityFrameworkCore;
using SmartOfferSlotBooking.Models;

namespace SmartOfferSlotBooking.Data;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<User> Users => Set<User>();
    public DbSet<Business> Businesses => Set<Business>();
    public DbSet<Offer> Offers => Set<Offer>();
    public DbSet<OfferSlot> OfferSlots => Set<OfferSlot>();
    public DbSet<Booking> Bookings => Set<Booking>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(e => {
            e.HasKey(x => x.Id);
            e.HasIndex(x => x.Email).IsUnique();
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
        });

        modelBuilder.Entity<Business>(e => {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasOne(x => x.AdminUser).WithMany().HasForeignKey(x => x.AdminUserId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Offer>(e => {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.Property(x => x.OriginalPrice).HasColumnType("numeric(10,2)");
            e.Property(x => x.OfferPrice).HasColumnType("numeric(10,2)");
            e.Property(x => x.DiscountPercentage).HasColumnType("numeric(5,2)");
            e.HasOne(x => x.Business).WithMany(x => x.Offers).HasForeignKey(x => x.BusinessId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<OfferSlot>(e => {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasOne(x => x.Offer).WithMany(x => x.Slots).HasForeignKey(x => x.OfferId).OnDelete(DeleteBehavior.Cascade);
        });

        modelBuilder.Entity<Booking>(e => {
            e.HasKey(x => x.Id);
            e.Property(x => x.Id).HasDefaultValueSql("gen_random_uuid()");
            e.HasIndex(x => x.BookingReference).IsUnique();
            e.HasOne(x => x.Offer).WithMany().HasForeignKey(x => x.OfferId).OnDelete(DeleteBehavior.SetNull);
            e.HasOne(x => x.Slot).WithMany(x => x.Bookings).HasForeignKey(x => x.SlotId).OnDelete(DeleteBehavior.SetNull);
        });
    }
}
