namespace route_and_trip_management_service.DTO
{
    public class RouteResponseDTO
    {
        public Guid RouteID { get; set; }
        public required string StartPoint { get; set; }
        public required string EndPoint { get; set; }
        public double Distance { get; set; }
        public required string EstimatedDuration { get; set; }
        public required string BelongsToProvinceID { get; set; }
        public required string PassesThroughCityID { get; set; }
    }
}
