const amqp = require("amqplib");
const tripService = require("../../services/tripService");
require("dotenv").config();

async function bookingCancelledConsumer() {
  const env = process.env.NODE_ENV || "development";
  const rabbitHost = env === "development" ? "localhost" : "rabbitmq-bus";
  const connection = await amqp.connect(`amqp://admin:admin@${rabbitHost}:5672`);
  // const connection = await amqp.connect("amqp://admin:admin@rabbitmq-bus:5672");
  const channel = await connection.createChannel();
  const queue = "booking.route.cancelled";

  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      try {
        await tripService.removeBookedSeats(data.TripId, data.SeatNumbers);
        console.log("✅ Seats released for cancelled booking:", data.TripId);
      } catch (err) {
        console.error("❌ Error releasing seats:", err.message);
      }
      channel.ack(msg);
    }
  });
}

module.exports = bookingCancelledConsumer;
