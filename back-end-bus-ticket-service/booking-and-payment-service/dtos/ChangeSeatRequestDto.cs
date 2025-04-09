namespace booking_and_payment_service.dtos
{
    public class ChangeSeatRequestDto
    {
        public string BookingId { get; set; }
        public string OldTripId { get; set; }
        public List<string> OldSeatNumbers { get; set; }
        public string NewTripId { get; set; }
        public List<string> NewSeatNumbers { get; set; }
    }
}