const bookingCreatedConsumer = require("./queues/bookingCreatedConsumer");
const bookingCancelledConsumer = require("./queues/bookingCancelledConsumer");
const bookingChangedConsumer = require("./queues/bookingChangedConsumer");

async function startConsumers() {
  try {
    await bookingCreatedConsumer();
    await bookingCancelledConsumer();
    await bookingChangedConsumer();
    console.log("🎧 All consumers started!");
  } catch (err) {
    console.error("❌ Error starting consumers:", err.message);
  }
}

module.exports = startConsumers; 