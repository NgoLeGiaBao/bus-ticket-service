using Microsoft.AspNetCore.Mvc;
using booking_and_payment_service.services;
using booking_and_payment_service.responses;
using booking_and_payment_service.models;
using booking_and_payment_service.dtos;

namespace booking_and_payment_service.controllers
{
    [ApiController]
    [Route("api/bookings")]
    public class BookingController : ControllerBase
    {
        private readonly BookingService _bookingService;

        public BookingController(BookingService bookingService)
        {
            _bookingService = bookingService;
        }

        [HttpPost]
        public async Task<ActionResult<ApiResponse<BookingResponseDto>>> CreateBooking([FromBody] BookingRequestDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse<BookingResponseDto>( false, "Invalid input data", null, string.Join("; ", ModelState.Values     .SelectMany(x => x.Errors)     .Select(x => x.ErrorMessage))));
            }

            var result = await _bookingService.CreateBookingAsync(dto, "customer");

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<ApiResponse<List<Booking>>>> GetAllBookings()
        {
            var result = await _bookingService.GetAllBookingsAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<ApiResponse<Booking>>> GetBookingById(string id)
        {
            var result = await _bookingService.GetBookingByIdAsync(id);

            if (!result.Success)
                return NotFound(result);

            return Ok(result);
        }
    }
}
