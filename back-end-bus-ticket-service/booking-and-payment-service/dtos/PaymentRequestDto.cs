using System.ComponentModel.DataAnnotations;

namespace booking_and_payment_service.dtos
{
    public class PaymentRequestDto
    {
        [Required]
        public string BookingId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [Required]
        [RegularExpression(@"^(VNPAY|MOMO|CASH|UNKNOWN)$", ErrorMessage = "Method must be 'VNPAY', 'MOMO', or 'CASH', UNKNOWN")]
        public string Method { get; set; }
    }
}
