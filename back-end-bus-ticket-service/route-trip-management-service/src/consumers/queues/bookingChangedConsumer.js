const amqp = require("amqplib");
const tripService = require("../../services/tripService");
require("dotenv").config();

async function bookingChangedConsumer() {
  const env = process.env.NODE_ENV || "development";
  const rabbitHost = env === "development" ? "localhost" : "rabbitmq-bus";
  const connection = await amqp.connect(`amqp://admin:admin@${rabbitHost}:5672`);
  const channel = await connection.createChannel();
  const queue = "booking.route.changed";

  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());

      try {
        const { OldTripId, OldSeatNumbers, NewTripId, NewSeatNumbers } = data;

        //Call tripService to update booked seats
        await tripService.removeBookedSeats(OldTripId, OldSeatNumbers);
        await tripService.addBookedSeats(NewTripId, NewSeatNumbers);

        console.log("✅ Booking changed handled:");
        console.log("🔁 From Trip:", OldTripId, "Seats:", OldSeatNumbers);
        console.log("🆕 To Trip:", NewTripId, "Seats:", NewSeatNumbers);
      } catch (err) {
        console.error("❌ Error handling booking change:", err.message);
      }

      channel.ack(msg);
    }
  });
}

module.exports = bookingChangedConsumer;
