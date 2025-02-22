using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace route_and_trip_management_service.Migrations
{
    /// <inheritdoc />
    public partial class route_and_trip_management_v01 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Routes",
                columns: table => new
                {
                    RouteID = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    StartPoint = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    EndPoint = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Distance = table.Column<double>(type: "float", nullable: false),
                    EstimatedDuration = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    BelongsToProvinceID = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    PassesThroughCityID = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Routes", x => x.RouteID);
                });

            migrationBuilder.CreateTable(
                name: "Trips",
                columns: table => new
                {
                    TripID = table.Column<Guid>(type: "uniqueidentifier", nullable: false, defaultValueSql: "NEWID()"),
                    RouteID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DepartureDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    ArrivalDateTime = table.Column<DateTime>(type: "datetime2", nullable: false),
                    Type = table.Column<int>(type: "int", nullable: false),
                    TicketPrice = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    RouteDirection = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    Status = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Trips", x => x.TripID);
                    table.ForeignKey(
                        name: "FK_Trips_Routes_RouteID",
                        column: x => x.RouteID,
                        principalTable: "Routes",
                        principalColumn: "RouteID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Trips_RouteID",
                table: "Trips",
                column: "RouteID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Trips");

            migrationBuilder.DropTable(
                name: "Routes");
        }
    }
}
