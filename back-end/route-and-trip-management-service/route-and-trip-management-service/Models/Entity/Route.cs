using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace route_and_trip_management_service.Models.Entity {
    public class Route {
        [Key]
        public Guid RouteID { get; set; } = Guid.NewGuid();
        [Required]
        [MaxLength(255)]
        public required string StartPoint { get; set; }
        [Required]
        [MaxLength(255)]
        public required string EndPoint { get; set; }
        public double Distance { get; set; }
        public required string EstimatedDuration  { get; set; }
        [JsonIgnore]  
        public ICollection<Trip>? Trips { get; set; }
        [Required]
        public required string BelongsToProvinceID { get; set; }
        [Required]
        public required string PassesThroughCityID { get; set; }
    }
}