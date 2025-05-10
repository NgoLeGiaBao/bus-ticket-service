require("dotenv").config({
    path: process.env.NODE_ENV === 'production' ? '.env.docker' : '.env.local'
});

const express = require('express');
const routeVehicles =  require('./routes/vehicleRoutes');

const app = express();
app.use(express.json());
app.use(routeVehicles);

app.listen(9504, () => console.log('Server running on port 9504'));