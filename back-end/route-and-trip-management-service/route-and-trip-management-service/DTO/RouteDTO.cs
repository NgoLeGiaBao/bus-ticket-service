namespace route_and_trip_management_service.DTO
{
    public class RouteDTO {
        public string StartPoint { get; set; } = string.Empty;
        public string EndPoint { get; set; } = string.Empty;
        public double Distance { get; set; } 
        public string EstimatedDuration { get; set; } = string.Empty;
        public string BelongsToProvinceID { get; set; } = string.Empty;
        public string PassesThroughCityID { get; set; } = string.Empty;
    }
}