using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace booking_and_payment_service.dtos
{
    public class BookingRequestDto
    {
        [Required]
        public string PhoneNumber { get; set; }

        public string? Email { get; set; }

        [Required]
        public string CustomerName { get; set; }

        [Required]
        public string TripId { get; set; }

        [Required]
        [MinLength(1)]
        public List<string> SeatNumbers { get; set; } 

        public decimal Amount { get; set; }
    }
}
