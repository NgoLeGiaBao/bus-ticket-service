using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using route_and_trip_management_service.DTO;
using route_and_trip_management_service.Helpers;
using route_and_trip_management_service.Models.Entity;
using Route = route_and_trip_management_service.Models.Entity.Route;

namespace route_and_trip_management_service.Controllers {
    [Route("route-and-trip-management-service/routes")]
    [ApiController]
    public class RouteController : ControllerBase
    {
        private readonly AppDbContext _context;
        private readonly ILogger<RouteController> _logger;

        public RouteController(AppDbContext context, ILogger<RouteController> logger)
        {
            _context = context;
            _logger = logger;
        }

        /// <summary>
        /// Retrieve a specific route by its unique identifier.
        /// </summary>
        /// <param name="id">The unique identifier (GUID) of the route.</param>
        /// <returns>
        /// - HTTP 200 (OK) if the route is found, returning the route data.
        /// - HTTP 404 (Not Found) if the route does not exist.
        /// - HTTP 500 (Internal Server Error) if an error occurs while retrieving the route.
        /// </returns>
        [HttpGet("get/{id}")]
        public async Task<IActionResult> GetRouteById(Guid id)
        {
            try
            {
                var route = await _context.Routes.FirstOrDefaultAsync(r => r.RouteID == id);
                if (route == null)
                    return NotFound(ApiResponse<object>.ErrorResponse("Route not found"));
                return Ok(ApiResponse<Route>.SuccessResponse(route, "Route retrieved successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while retrieving route");
                return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred while fetching the route"));
            }
        }

        /// <summary>
        /// Check if a route with the given StartPoint and EndPoint exists (bi-directional check).
        /// </summary>
        /// <param name="startPoint">The starting location of the route.</param>
        /// <param name="endPoint">The destination location of the route.</param>
        /// <returns>
        /// - HTTP 200 (OK) with `exists: true/false`.
        /// - HTTP 500 (Internal Server Error) if an error occurs.
        /// </returns>
        [HttpGet("check-exists")]
        public async Task<IActionResult> CheckRouteExists([FromQuery] string startPoint, [FromQuery] string endPoint)
        {
            try
            {
                bool exists = await _context.Routes.AnyAsync(r =>
                    (r.StartPoint == startPoint && r.EndPoint == endPoint) ||
                    (r.StartPoint == endPoint && r.EndPoint == startPoint) // Check reverse direction
                );

                return Ok(ApiResponse<object>.SuccessResponse(new { exists }, "Route existence check completed"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while checking route existence");
                return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred while processing the request"));
            }
        }

        /// <summary>
        /// Creates a new route and saves it to the database.
        /// </summary>
        /// <param name="dto">Route data from the request body.</param>
        /// <returns>
        /// - HTTP 200 (OK) if the route is created successfully.
        /// - HTTP 400 (Bad Request) if the input data is invalid.
        /// - HTTP 500 (Internal Server Error) if an error occurs during processing.
        /// </returns>
        [HttpPost]
        [Route("create")]
        public async Task<IActionResult> CreateNewRouteAsync([FromBody] RouteDTO dto)
        {
            // Check if required fields are present
            var errors = ValidationHelper.ValidateRequiredFields(dto, "StartPoint", "EndPoint", "EstimatedDuration", "BelongsToProvinceID", "PassesThroughCityID");
            if (errors.Count > 0)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data", errors));

            // Create new route
            var route = new Route
            {
                RouteID = Guid.NewGuid(),
                StartPoint = dto.StartPoint,
                EndPoint = dto.EndPoint,
                Distance = dto.Distance,
                EstimatedDuration = dto.EstimatedDuration,
                BelongsToProvinceID = dto.BelongsToProvinceID,
                PassesThroughCityID = dto.PassesThroughCityID
            };

            // Save route to database
            try
            {
                _context.Routes.Add(route);
                await _context.SaveChangesAsync();
                return Ok(ApiResponse<object>.SuccessResponse(route, "Route created successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while creating route");
                return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred while creating the route"));
            }
        }
    
        /// <summary>
        /// Updates an existing route based on the provided route ID.
        /// </summary>
        /// <param name="routeId">The unique identifier of the route to be updated.</param>
        /// <param name="dto">The data transfer object containing updated route details.</param>
        /// <returns>Returns a success response if the update is successful, or an error response if the route is not found or an exception occurs.</returns>
        [HttpPut("update/{routeId}")]
        public async Task<IActionResult> UpdateRouteAsync(Guid routeId, [FromBody] RouteDTO dto)
        {
            // Find the existing route by ID
            var existingRoute = await _context.Routes.FindAsync(routeId);
            if (existingRoute == null)
                return NotFound(ApiResponse<object>.ErrorResponse("Route not found"));

            // Check if required fields are present
            var errors = ValidationHelper.ValidateRequiredFields(dto, "StartPoint", "EndPoint", "EstimatedDuration", "BelongsToProvinceID", "PassesThroughCityID");
            if (errors.Count > 0)
                return BadRequest(ApiResponse<object>.ErrorResponse("Invalid data", errors));
                
            // Update route properties with new values from DTO
            existingRoute.StartPoint = dto.StartPoint;
            existingRoute.EndPoint = dto.EndPoint;
            existingRoute.Distance = dto.Distance;
            existingRoute.EstimatedDuration = dto.EstimatedDuration;
            existingRoute.BelongsToProvinceID = dto.BelongsToProvinceID;
            existingRoute.PassesThroughCityID = dto.PassesThroughCityID;

            // Save changes to the database
            try
            {
                await _context.SaveChangesAsync();
                return Ok(ApiResponse<object>.SuccessResponse(existingRoute, "Route updated successfully"));
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error occurred while updating route");
                return StatusCode(500, ApiResponse<object>.ErrorResponse("An error occurred while updating the route"));
            }
        }
    }

}
