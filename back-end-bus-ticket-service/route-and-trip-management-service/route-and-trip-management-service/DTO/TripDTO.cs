using System;
using route_and_trip_management_service.Models.Enums;

namespace route_and_trip_management_service.DTO
{
    public class TripDTO
    {
        public DateTime DepartureDateTime { get; set; }
        public BusType Type { get; set; } 
        public decimal TicketPrice { get; set; }
        public string RouteDirection { get; set; } = string.Empty;
        public TripStatusType Status { get; set; } = TripStatusType.WaitingForDeparture;
    }
}