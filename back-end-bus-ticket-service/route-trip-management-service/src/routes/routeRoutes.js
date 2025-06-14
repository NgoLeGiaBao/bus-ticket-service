const express = require('express');
const RouteController = require('../controllers/routeController');
const { verifyToken, verifyRole } = require('../auth');

const router = express.Router();

// Create a new route (Admin only)
router.post('/routes', verifyToken, verifyRole('Admin'), RouteController.createRouteController);

// Get all routes
router.get('/routes', RouteController.getRoutesController);

// Get all destinations (origin and destination)
router.get('/destinations/all', RouteController.getAllDestinationsController);

// Get all routes by origin and destination
router.get('/destinations', RouteController.getDestinationsFromOriginController);

// Get a route by ID
router.get('/routes/:id', verifyToken, RouteController.getRouteByIdController);

// Update a route (Admin only)
router.put('/routes/:id', verifyToken, verifyRole('Admin'), RouteController.updateRouteController);

// Delete a route (Admin only)
router.delete('/routes/:id', verifyToken, verifyRole('Admin'), RouteController.deleteRouteController);

// Toggle route status (Admin only)
router.put('/routes/:id/toggle', RouteController.toggleRouteStatusController);

module.exports = router;