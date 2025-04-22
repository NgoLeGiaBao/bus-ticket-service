require("dotenv").config({
    path: process.env.NODE_ENV === 'production' ? '.env.docker' : '.env.local'
});

const express = require('express');
const routeRoutes = require('./routes/routeRoutes');
const tripRoutes = require('./routes/tripRoutes');
const startConsumers = require("./consumers/bookingConsumer");

startConsumers();


const app = express();
app.use(express.json());

app.use(routeRoutes);
app.use(tripRoutes);

app.listen(9502, () => console.log('Server running on port 9502'));