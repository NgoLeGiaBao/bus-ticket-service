using booking_and_payment_service.models;
namespace booking_and_payment_service.dtos
{
    public class TicketInfo
    {
        public Booking booking { get; set; }
        public Payment payment { get; set; }
        public TripLookupDto trip { get; set; }
    }
}