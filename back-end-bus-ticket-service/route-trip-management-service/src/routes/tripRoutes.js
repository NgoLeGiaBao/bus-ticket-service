const express = require('express');
const TripController = require('../controllers/tripController');
const { verifyToken, verifyRole } = require('../auth');

const router = express.Router();

// Create a new trip (Admin only)
router.post('/trips', verifyToken, verifyRole('Admin'), TripController.createTripController);

// Get all trips
router.get('/trips', TripController.getTripsController);

// Get a trip by ID
router.get('/trips/:id', TripController.getTripByIdController);

// Update a trip (Admin only)
router.put('/trips/:id', verifyToken, verifyRole('Admin'), TripController.updateTripController);

// Delete a trip (Admin only)
router.delete('/trips/:id', verifyToken, verifyRole('Admin'), TripController.deleteTripController);

module.exports = router;
