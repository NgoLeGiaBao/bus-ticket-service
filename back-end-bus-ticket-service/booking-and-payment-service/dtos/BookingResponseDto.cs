using System;
using System.Collections.Generic;

namespace booking_and_payment_service.dtos
{
    public class BookingResponseDto
    {
        public string Id { get; set; }
        public string CustomerName { get; set; }
        public string PhoneNumber { get; set; }
        public string? Email { get; set; }
        public string TripId { get; set; }
        public List<string> SeatNumbers { get; set; }
        public DateTime BookingTime { get; set; }
        public string Status { get; set; }
    }
}
