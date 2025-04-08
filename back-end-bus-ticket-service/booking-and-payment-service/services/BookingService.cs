using booking_and_payment_service.models;
using booking_and_payment_service.responses;
using booking_and_payment_service.dtos;
using booking_and_payment_service.data;

using Microsoft.EntityFrameworkCore;

namespace booking_and_payment_service.services
{
    public class BookingService
    {
        private readonly UserDbContext _context;
        private readonly RedisService _redisService;

        public BookingService(UserDbContext context, RedisService redisService)
        {
            _context = context;
            _redisService = redisService;
        }

        public async Task<ApiResponse<Booking>> CreateBookingAsync(BookingRequestDto dto, string bookingBy)
        {
            try
            {
                // Check in redis
                foreach (var seat in dto.SeatNumbers)
                {
                    string redisKey = $"booking:{dto.TripId}:{seat}";
                    if (await _redisService.KeyExistsAsync(redisKey))
                    {
                        return new ApiResponse<Booking>(
                            false,
                            $"Seat {seat} is temporarily locked by another booking.",
                            null,
                            "SeatLocked"
                        );
                    }
                }

                // Get all existing bookings for the same trip
                var existingBookings = await _context.Bookings
                    .Where(b => b.TripId == dto.TripId)
                    .ToListAsync();

                var allBookedSeats = existingBookings.SelectMany(b => b.SeatNumbers).ToList();
                var conflictSeats = dto.SeatNumbers.Intersect(allBookedSeats).ToList();

                if (conflictSeats.Any())
                {
                    return new ApiResponse<Booking>(
                        false,
                        $"Seats already booked: {string.Join(", ", conflictSeats)}",
                        null,
                        "SeatConflict"
                    );
                }

                // Create new booking
                var booking = new Booking
                {
                    Id = Booking.GenerateBookingId(),
                    PhoneNumber = dto.PhoneNumber,
                    Email = dto.Email,
                    CustomerName = dto.CustomerName,
                    TripId = dto.TripId,
                    SeatNumbers = dto.SeatNumbers,
                    BookingTime = DateTime.UtcNow,
                    Status = bookingBy == "customer" ? "Pending" : "Booked",
                };

                _context.Bookings.Add(booking);
                await _context.SaveChangesAsync();
                
                // Save to redis
                foreach (var seat in dto.SeatNumbers)
                {
                    string redisKey = $"booking:{dto.TripId}:{seat}";
                    await _redisService.SetKeyAsync(redisKey, booking.Id, TimeSpan.FromMinutes(15));
                }

                return new ApiResponse<Booking>(
                    true,
                    "Booking created successfully",
                    booking,
                    null
                );
            } 
            catch (Exception ex)
            {
                return new ApiResponse<Booking>(
                    false,
                    "An error occurred while creating booking",
                    null,
                    ex.Message
                );
            }
        }

        public async Task<ApiResponse<List<Booking>>> GetAllBookingsAsync()
        {
            var bookings = await _context.Bookings.ToListAsync();
            return new ApiResponse<List<Booking>>(true, "List of bookings", bookings, null);
        }

        public async Task<ApiResponse<Booking>> GetBookingByIdAsync(string id)
        {
            var booking = await _context.Bookings.FindAsync(id);
            if (booking == null)
            {
                return new ApiResponse<Booking>(false, "Booking not found", null, "NotFound");
            }

            return new ApiResponse<Booking>(true, "Booking found", booking, null);
        }
    }
}
