const express = require('express');
const routeRoutes = require('./routes/routeRoutes');
const tripRoutes = require('./routes/tripRoutes');

const app = express();
app.use(express.json());

app.use('/api', routeRoutes);
app.use('/api', tripRoutes);

app.listen(9502, () => console.log('Server running on port 9502'));