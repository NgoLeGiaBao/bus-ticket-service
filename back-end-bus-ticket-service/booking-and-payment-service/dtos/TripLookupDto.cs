namespace booking_and_payment_service.dtos
{
    public class TripLookupDto
    {
        public DateTime TripDate { get; set; }
        public string Origin { get; set; }
        public string Destination { get; set; }
        public string RouteId { get; set; }
    }
}


