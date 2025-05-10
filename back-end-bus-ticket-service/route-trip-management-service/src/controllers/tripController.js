const tripService = require('../services/tripService');

// Create a new trip
exports.createTripController = async (req, res) => {
    try {
        const { tripDate, availableSeats, routeId, price, vehicle_type } = req.body;
        const trip = await tripService.createTripService(tripDate, availableSeats, routeId, price, vehicle_type);
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

// Get all available trips based on route id
exports.getAvailableTripsController = async (req, res) => {
    try {
        const { from, to, tripDate } = req.query;

        const result = await tripService.getAvailableTripsService(from, to, tripDate);
        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.status(200).json(result);
    } catch (err) {
        return res.status(500).json({
            success: false,
            message: 'Internal server error.',
            data: null,
            error: err.message
        });
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

// Update trip status
exports.updateVehicleForTripController = async (req, res) => {
    try {
        const { id } = req.params;
        const {license_plate, vehicle_id} = req.body;
        const trip = await tripService.updateVehicleForTripService(id, {license_plate, vehicle_id});
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


// Check same route
exports.isSameRouteController = async (req, res) => {
    const { tripId1, tripId2 } = req.query;
    try {
        const isSameRoute = await tripService.isSameRoute(tripId1, tripId2);

        res.status(200).json({
            success: true,
            message: isSameRoute
                ? 'Trips have the same route'
                : 'Trips have different routes',
            data: isSameRoute
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};


// Get trips by route ID
exports.getTripsByRouteIdController = async (req, res) => {
    try {
        const { routeId } = req.params;
        const trips = await tripService.getTripsByRouteIdService(routeId);
        res.status(200).json({ success: true, data: trips });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

// Update trip status
exports.updateTripStatusController = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // Validate status before updating
        const validStatuses = ['scheduled', 'ongoing', 'completed', 'cancelled'];  
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ success: false, message: 'Invalid status value' });
        }

        const updatedTrip = await tripService.updateTripStatusService(id, status);
        res.status(200).json({ success: true, data: updatedTrip });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};