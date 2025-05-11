using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace booking_and_payment_service.Migrations
{
    /// <inheritdoc />
    public partial class AddPickupAndDropoffToBooking : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "DropOffPoint",
                table: "Bookings",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "PickUpPoint",
                table: "Bookings",
                type: "text",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DropOffPoint",
                table: "Bookings");

            migrationBuilder.DropColumn(
                name: "PickUpPoint",
                table: "Bookings");
        }
    }
}
