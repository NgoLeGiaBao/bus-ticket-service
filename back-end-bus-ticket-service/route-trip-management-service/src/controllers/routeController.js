const routeService = require('../services/routeService');

// Create a new route
const createRouteController = async (req, res) => {
    const { origin, destination, distance, duration, price, subroutes } = req.body;

    try {
        const routeWithSubroutes = await routeService.createRouteService(origin, destination, distance, duration, price, subroutes);
        res.status(201).json({ success: true, message: 'Route created successfully', data: routeWithSubroutes });
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

// Get all destinations
// Controller function to handle the route for fetching all origins and destinations
const getAllDestinationsController = async (req, res) => {
    try {
        // Gọi service để lấy tất cả điểm đi và điểm đến trong một tập hợp chung
        const result = await routeService.getAllDestinationsService();

        if (result.success) {
            // Trả về kết quả thành công
            res.status(200).json(result);
        } else {
            // Trả về lỗi nếu có
            res.status(400).json(result);
        }
    } catch (error) {
        // Lỗi bất ngờ
        res.status(500).json({
            success: false,
            message: 'An unexpected error occurred.',
            data: null,
            error: error.message,
        });
    }
};

// Controller function to handle the route for fetching destinations from a specific origin
const getDestinationsFromOriginController = async (req, res) => {
    try {
        // Lấy origin từ query parameters
        const { origin } = req.query;

        // Kiểm tra nếu không có origin
        if (!origin) {
            return res.status(400).json({
                success: false,
                message: 'Missing required query parameter: origin',
                data: null,
                error: 'Bad Request'
            });
        }

        // Call service to fetch destinations
        const result = await routeService.getDestinationsFromOriginService(origin);

        if (result.success) {
            // Send success response with data
            res.status(200).json(result);
        } else {
            // Send error response if something went wrong
            res.status(400).json(result);
        }
    } catch (error) {
        // Catch unexpected errors and return a generic error response
        res.status(500).json({
            success: false,
            message: 'An unexpected error occurred.',
            data: null,
            error: error.message,
        });
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
    const { origin, destination, distance, duration, price, is_active, subroutes } = req.body;

    try {
        const updatedRoute = await routeService.updateRouteService(id, origin, destination, distance, duration, price, is_active, subroutes);
        res.status(200).json({ success: true, message: 'Route updated successfully', data: updatedRoute });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Toggle route 
const toggleRouteStatusController = async (req, res) => {
    const { id } = req.params; 
    const { is_active } = req.body; 
  
    try {
        const updatedRoute = await routeService.toggleRouteStatusService(id, is_active);
        return res.json({
            message: 'Trạng thái tuyến đã được cập nhật.',
            data: updatedRoute,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái tuyến' });
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
    getDestinationsFromOriginController,
    getAllDestinationsController,
    toggleRouteStatusController
};
