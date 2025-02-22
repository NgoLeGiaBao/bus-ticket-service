using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using route_and_trip_management_service.DTO;
using route_and_trip_management_service.Helpers;
using route_and_trip_management_service.Models.Entity;
using route_and_trip_management_service.Models.Enums;

namespace route_and_trip_management_service.Controllers {
    [Route("route-and-trip-management-service/trips")]
    [ApiController]
    public class TripController : ControllerBase
    {  
        private readonly AppDbContext _context;
        private readonly ILogger<RouteController> _logger;

        public TripController(AppDbContext context, ILogger<RouteController> logger) {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Retrieve a specific trip by its unique identifier.
        /// </summary>
        /// <param name="id">The unique identifier (GUID) of the trip.</param>
        /// <returns>
        /// - HTTP 200 (OK) if the trip is found, returning the trip data.
        /// - HTTP 404 (Not Found) if the trip does not exist.
        /// - HTTP 500 (Internal Server Error) if an error occurs while retrieving the trip.
        /// </returns>
        [HttpGet("get/{id}")]
        public async Task<IActionResult> GetTripById(Guid id)
        {
            try
            {
                var trip = await _context.Trips
                            .Include(t => t.Route)
                            .FirstOrDefaultAsync(t => t.TripID == id);
                if (trip == null)
                    return NotFound(ApiResponse<object>.ErrorResponse("Trip not found"));
                return Ok(ApiResponse<Trip>.SuccessResponse(trip, "Trip retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving trip");
                return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred while fetching the trip"));
            }
        }

        /// <summary>
        /// Creates a new trip based on the provided route ID and trip details.
        /// </summary>
        /// <param name="routeId">The unique identifier of the route (passed as a query parameter).</param>
        /// <param name="dto">The data transfer object containing trip details.</param>
        /// <returns>Returns the created trip if successful, or an error response if validation fails.</returns>
        [HttpPost("create")]
        public async Task<IActionResult> CreateTripAsync([FromQuery] Guid routeId, [FromBody] TripDTO dto)
        {
            // Validate required fields in DTO
            var errors = ValidationHelper.ValidateRequiredFields(dto, "DepartureDateTime", "TicketPrice", "RouteDirection");
            if (errors.Count > 0)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data", errors));

            // Validate routeId
            if (routeId == Guid.Empty)
                return BadRequest(ApiResponse<object>.ErrorResponse("RouteId is required and must be a valid GUID"));

            // Check if the route exists
            var route = await _context.Routes.FindAsync(routeId);
            if (route == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Route not found"));

            // Retrieve route information (EstimatedDuration)
            var routeInfo = await _context.Routes
                .Where(r => r.RouteID == routeId)
                .Select(r => new { r.EstimatedDuration })
                .FirstOrDefaultAsync();

            if (routeInfo == null || string.IsNullOrEmpty(routeInfo.EstimatedDuration))
                return BadRequest(ApiResponse<object>.ErrorResponse("Route does not have a valid EstimatedDuration"));

            // Convert EstimatedDuration from string to TimeSpan
            if (!TimeSpan.TryParse(routeInfo.EstimatedDuration, out TimeSpan duration))
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid EstimatedDuration format. Expected format: HH:mm:ss"));
        
            // Create new trip
            var trip = new Trip
            {
                TripID = Guid.NewGuid(),
                RouteID = routeId,
                DepartureDateTime = dto.DepartureDateTime,
                ArrivalDateTime = dto.DepartureDateTime.Add(duration),
                Type = dto.Type,
                TicketPrice = dto.TicketPrice,
                RouteDirection = dto.RouteDirection,
                Status = TripStatusType.WaitingForDeparture
            };

            try
            {
                // Save trip to database
                _context.Trips.Add(trip);
                await _context.SaveChangesAsync();
                return Ok(ApiResponse<object>.SuccessResponse(trip, "Trip created successfully"));
            }
            catch (Exception ex)
            {
                // Log error and return server error response
                _logger.LogError(ex, "Error occurred while creating trip");
                return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred while creating the trip"));
            }
        }
    

        /// <summary>
        /// Update the details of a specific trip including other trip information.
        /// </summary>
        /// <param name="id">The unique identifier (GUID) of the trip.</param>
        /// <param name="tripUpdate">The updated trip information (type, ticketPrice, route direction, etc.) from the DTO.</param>
        /// <returns>
        /// - HTTP 200 (OK) if the trip is updated successfully.
        /// - HTTP 404 (Not Found) if the trip does not exist.
        /// - HTTP 400 (Bad Request) if invalid data is provided.
        /// - HTTP 500 (Internal Server Error) if an error occurs while updating the trip.
        /// </returns>
        [HttpPut("update/{id}")]
        public async Task<IActionResult> UpdateTrip(Guid id, [FromBody] TripDTO tripUpdate)  
        {
            try
            {
                var trip = await _context.Trips
                            .Include(t => t.Route)
                            .FirstOrDefaultAsync(t => t.TripID == id);
                if (trip == null)
                    return NotFound(ApiResponse<object>.ErrorResponse("Trip not found"));

                if (trip?.Route?.EstimatedDuration == null || string.IsNullOrEmpty(trip.Route.EstimatedDuration))
                    return BadRequest(ApiResponse<object>.ErrorResponse("Route does not have a valid EstimatedDuration"));
                
                // Convert EstimatedDuration from string to TimeSpan
                if (!TimeSpan.TryParse(trip.Route.EstimatedDuration, out TimeSpan duration))
                    return BadRequest(ApiResponse<object>.ErrorResponse("Invalid EstimatedDuration format. Expected format: HH:mm:ss"));
                
                // Update the properties from body (TripDTO)
                trip.Type = tripUpdate.Type;
                trip.TicketPrice = tripUpdate.TicketPrice;
                trip.RouteDirection = tripUpdate.RouteDirection;
                trip.DepartureDateTime = tripUpdate.DepartureDateTime;
                trip.ArrivalDateTime = tripUpdate.DepartureDateTime.Add(duration);
                trip.Status = tripUpdate.Status;

                _context.Trips.Update(trip);
                await _context.SaveChangesAsync();

                return Ok(ApiResponse<Trip>.SuccessResponse(trip, "Trip updated successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating trip");
                return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred while updating the trip"));
            }
        }
    }
}