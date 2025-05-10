const express = require('express');
const TripController = require('../controllers/tripController');
const { verifyToken, verifyRole } = require('../auth');

const router = express.Router();

// Create a new trip (Admin only)
router.post('/trips', verifyToken, verifyRole('Admin'), TripController.createTripController);

// Get all trips
router.get('/trips', TripController.getTripsController);

// Get all available trips based on route id
router.get('/available-trips', TripController.getAvailableTripsController);


// Get a trip by ID
router.get('/trips/:id', TripController.getTripByIdController);

// Update a trip (Admin only)
router.put('/trips/:id', verifyToken, verifyRole('Admin'), TripController.updateTripController);

// Delete a trip (Admin only)
router.delete('/trips/:id', verifyToken, verifyRole('Admin'), TripController.deleteTripController);

// Check same route
router.get('/same-route-trips', TripController.isSameRouteController);

// Get trips by route ID
router.get('/trips/route/:routeId', TripController.getTripsByRouteIdController);

// Update trip status (Admin only)
router.put('/trips/:id/status', verifyToken, verifyRole('Admin'), TripController.updateTripStatusController);

// Update vehicle for a trip (Admin only)
router.put('/trips/:id/vehicle', verifyToken, verifyRole('Admin'), TripController.updateVehicleForTripController);
module.exports = router;
