const tripService = require('../services/tripService');

// Create a new trip
exports.createTripController = async (req, res) => {
    try {
        const { tripDate, availableSeats, routeId } = req.body;
        const trip = await tripService.createTripService(tripDate, availableSeats, routeId);
        res.status(201).json({ success: true, data: trip });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get all trips
exports.getTripsController = async (req, res) => {
    try {
        const trips = await tripService.getTripsService();
        res.status(200).json({ success: true, data: trips });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Get a specific trip by ID
exports.getTripByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const trip = await tripService.getTripByIdService(id);
        res.status(200).json({ success: true, data: trip });
    } catch (error) {
        res.status(404).json({ success: false, message: error.message });
    }
};

// Update an existing trip
exports.updateTripController = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        const trip = await tripService.updateTripService(id, updates);
        res.status(200).json({ success: true, data: trip });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Delete a trip by ID
exports.deleteTripController = async (req, res) => {
    try {
        const { id } = req.params;
        const trip = await tripService.deleteTripService(id);
        res.status(200).json({ success: true, message: 'Trip deleted successfully', data: trip });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
