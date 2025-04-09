const bookingCreatedConsumer = require("./queues/bookingCreatedConsumer");
const bookingCancelledConsumer = require("./queues/bookingCancelledConsumer");

async function startConsumers() {
  try {
    await bookingCreatedConsumer();
    await bookingCancelledConsumer();
    console.log("🎧 All consumers started!");
  } catch (err) {
    console.error("❌ Error starting consumers:", err.message);
  }
}

module.exports = startConsumers; 