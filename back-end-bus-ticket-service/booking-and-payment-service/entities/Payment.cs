using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace booking_and_payment_service.models
{
    public class Payment
    {
        [Key]
        public Guid Id { get; set; }

        [Required]
        public string BookingId { get; set; }

        [Required]
        [Range(0.01, double.MaxValue, ErrorMessage = "Amount must be greater than 0")]
        public decimal Amount { get; set; }

        [Required]
        public DateTime? PaymentTime { get; set; }

        [Required]
        [RegularExpression(@"^(Success|Failed|Pending|Waiting)$", ErrorMessage = "Status must be 'Success', 'Failed', Waiting or 'Pending'")]
        public string Status { get; set; } = "Pending";

        [Required]
        [RegularExpression(@"^(VNPAY|MOMO|CASH|UNKNOWN)$", ErrorMessage = "Method must be 'VNPAY', 'MOMO', or 'CASH', UNKNOWN")]
        public string Method { get; set; }
    }
}
