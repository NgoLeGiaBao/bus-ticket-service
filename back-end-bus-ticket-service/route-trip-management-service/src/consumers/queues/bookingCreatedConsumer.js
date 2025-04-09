const amqp = require("amqplib");
const tripService = require("../../services/tripService");
require("dotenv").config();


async function bookingCreatedConsumer() {
  const env = process.env.NODE_ENV || "development";
  const rabbitHost = env === "development" ? "localhost" : "rabbitmq-bus";
  const connection = await amqp.connect(`amqp://admin:admin@${rabbitHost}:5672`);
  // const connection = await amqp.connect("amqp://admin:admin@rabbitmq-bus:5672");
  const channel = await connection.createChannel();
  const queue = "booking.route.created";

  await channel.assertQueue(queue, { durable: true });

  channel.consume(queue, async (msg) => {
    if (msg !== null) {
      const data = JSON.parse(msg.content.toString());
      try {
        await tripService.addBookedSeats(data.TripId, data.SeatNumbers);
        console.log("✅ Booked seats updated for trip:", data.TripId);
      } catch (err) {
        console.error("❌ Error updating booked seats:", err.message);
      }
      channel.ack(msg);
    }
  });
}

module.exports = bookingCreatedConsumer;