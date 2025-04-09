using System;
using System.Collections.Generic;

using booking_and_payment_service.models;

namespace booking_and_payment_service.dtos
{
    public class BookingResponseDto
    {
        public Booking booking { get; set; }
        public decimal Amount { get; set; }
        public string PaymentUrl { get; set; }
    }
}
