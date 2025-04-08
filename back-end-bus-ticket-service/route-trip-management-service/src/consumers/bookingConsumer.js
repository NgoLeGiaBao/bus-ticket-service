const amqp = require("amqplib");
const tripService = require('../services/tripService');

async function bookingConsumer() {
  try {
    const connection = await amqp.connect("amqp://admin:admin@rabbitmq-bus:5672");
    const channel = await connection.createChannel();
    const queue = "booking.route.created";

    await channel.assertQueue(queue, { durable: true });
   

    channel.consume(queue, async (msg) => {
      if (msg !== null) {
        const data = JSON.parse(msg.content.toString());

        const tripId = data.TripId;
        const seatNumbers = data.SeatNumbers;
        try {
          await tripService.addBookedSeats(tripId, seatNumbers);
          console.log("✅ Successfully updated booked seats for trip:", tripId);
        } catch (err) {
          console.error("❌ Failed to update booked seats:", err.message);
        }

        channel.ack(msg);
      }
    });
  } catch (err) {
    console.error("❌ Error in bookingConsumer:", err);
  }
}



module.exports = bookingConsumer;
