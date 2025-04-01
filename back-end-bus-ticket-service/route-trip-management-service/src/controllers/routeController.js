const routeService = require('../services/routeService');

// Create a new route
const createRouteController = async (req, res) => {
    const { origin, destination, distance, duration, price } = req.body;

    try {
        const route = await routeService.createRouteService(origin, destination, distance, duration, price);
        res.status(201).json({ success: true, message: 'Route created successfully', data: route });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all routes
const getRoutesController = async (req, res) => {
    try {
        const routes = await routeService.getRoutesService();
        res.status(200).json({ success: true, data: routes });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get route by ID
const getRouteByIdController = async (req, res) => {
    const { id } = req.params;

    try {
        const route = await routeService.getRouteByIdService(id);
        if (route) {
            res.status(200).json({ success: true, data: route });
        } else {
            res.status(404).json({ success: false, message: 'Route not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update route by ID
const updateRouteController = async (req, res) => {
    const { id } = req.params;
    const { origin, destination, distance, duration, price } = req.body;

    try {
        const updatedRoute = await routeService.updateRouteService(id, origin, destination, distance, duration, price);
        res.status(200).json({ success: true, message: 'Route updated successfully', data: updatedRoute });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete route by ID
const deleteRouteController = async (req, res) => {
    const { id } = req.params;

    try {
        const deletedRoute = await routeService.deleteRouteService(id);
        if (deletedRoute) {
            res.status(200).json({ success: true, message: 'Route deleted successfully' });
        } else {
            res.status(404).json({ success: false, message: 'Route not found' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createRouteController,
    getRoutesController,
    getRouteByIdController,
    updateRouteController,
    deleteRouteController,
};
