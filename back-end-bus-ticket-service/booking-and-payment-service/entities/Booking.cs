using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace booking_and_payment_service.models
{
    public class Booking
    {
        [Key]
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        [RegularExpression(@"^[a-zA-Z0-9]{6}$", ErrorMessage = "Id must be a 6-character alphanumeric string (letters and digits)")]
        public string Id { get; set; }

        [Required]
        public string PhoneNumber { get; set; }

        public string? Email { get; set; } 

        [Required]
        public string CustomerName { get; set; }

        [Required]
        public string TripId { get; set; }

        [Required]
        [MinLength(1, ErrorMessage = "At least one seat must be selected")]
        public List<string> SeatNumbers { get; set; } = new List<string>();

        [Required]
        public DateTime BookingTime { get; set; } = DateTime.UtcNow;

        [Required]
        [RegularExpression(@"^(Pending|Booked|Cancelled|Late|Confirmed)$", ErrorMessage = "Status must be 'Pending', 'Confirmed', or 'Cancelled' or 'Late'")]
        public string Status { get; set; } = "Pending";

        public static string GenerateBookingId()
        {
            const string chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            var random = new Random();
            return new string(Enumerable.Repeat(chars, 6)
                .Select(s => s[random.Next(s.Length)]).ToArray());
        }
    }
}
