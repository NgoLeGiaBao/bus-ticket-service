using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using booking_and_payment_service.services;
using booking_and_payment_service.responses;
using booking_and_payment_service.models;
using booking_and_payment_service.dtos;

namespace booking_and_payment_service.controllers
{
    [ApiController]
    [Route("bookings")]
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
                return BadRequest(new ApiResponse<BookingResponseDto>(false, "Invalid input data", null, string.Join("; ", ModelState.Values.SelectMany(x => x.Errors).Select(x => x.ErrorMessage))));
            }

            var result = await _bookingService.CreateBookingAsync(dto, "customer");

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);
        }

        [Authorize(Roles = "Admin, Manager, Employee")]
        [HttpPost("create")]
        public async Task<ActionResult<ApiResponse<BookingResponseDto>>> CreateBookingEmployee([FromBody] BookingRequestDto dto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(new ApiResponse<BookingResponseDto>(false, "Invalid input data", null, string.Join("; ", ModelState.Values.SelectMany(x => x.Errors).Select(x => x.ErrorMessage))));
            }

            var result = await _bookingService.CreateBookingAsync(dto, "employee");

            if (!result.Success)
                return BadRequest(result);

            return Ok(result);

        }

        [Authorize(Roles = "Admin, Manager, Employee")]
        [HttpGet("phone")]
        public async Task<IActionResult> GetBookingsByPhone([FromQuery] string phoneNumber)
        {
            var result = await _bookingService.GetBookingsByPhoneAsync(phoneNumber);
            return Ok(result);
        }

        [Authorize(Roles = "Admin, Manager, Employee")]
        [HttpGet("seat-trip")]
        public async Task<IActionResult> GetBookingBySeatAndTrip([FromQuery] string seatNumber, [FromQuery] string tripId)
        {
            var result = await _bookingService.GetBookingBySeatAndRouteTripAsync(seatNumber, tripId);
            return Ok(result);
        }

        [Authorize(Roles = "Admin, Manager, Employee")]
        [HttpGet("confirmed")]
        public async Task<IActionResult> GetConfirmedBookingsByPhone([FromQuery] string phoneNumber)
        {
            var result = await _bookingService.GetConfirmedBookingsByPhoneAsync(phoneNumber);
            return Ok(result);
        }

        [HttpPost("change-seat")]
        public async Task<IActionResult> ChangeSeatAsync([FromBody] ChangeSeatRequestDto dto)
        {
            var result = await _bookingService.ChangeSeatAsync(dto);
            if (!result.Success)
            {
                return BadRequest(result);
            }
            return Ok(result);
        }

        [HttpGet("lookup")]
        public async Task<IActionResult> LookupTicket([FromQuery] string phoneNumber, [FromQuery] string bookingId)
        {
            var result = await _bookingService.LookupTicketAsync(phoneNumber, bookingId);
            return Ok(result);
        }
        
        [HttpGet("lookup-phone")]
        public async Task<IActionResult> LookupTicket([FromQuery] string phoneNumber)
        {
            var result = await _bookingService.LookupTicketsByPhoneAsync(phoneNumber);
            return Ok(result);
        }

    }
}
