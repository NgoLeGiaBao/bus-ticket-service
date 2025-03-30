using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using route_and_trip_management_service.Models.Enums;

namespace route_and_trip_management_service.Models.Entity {
    public class Trip
    {
        [Key]
        public Guid TripID { get; set; } = Guid.NewGuid();
        [Required]
        public Guid RouteID { get; set; }
        [ForeignKey("RouteID")]
        public Route? Route { get; set; } 
        public DateTime DepartureDateTime  { get; set; }
        public DateTime ArrivalDateTime  { get; set; }
        public BusType Type { get; set; } 
        public decimal TicketPrice { get; set; }
        [MaxLength(255)]
        public required string RouteDirection  { get; set; }
        public TripStatusType Status { get; set; } = TripStatusType.WaitingForDeparture;
    }
}