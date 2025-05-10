const express = require('express');
const vehicleController = require('../controllers/vehicleController');
const { verifyToken, verifyRole } = require('../auth');

const router = express.Router();

// Create a new vehicle (Admin only)
router.post('/vehicles', verifyToken, verifyRole('Admin'), vehicleController.createVehicleController);

// Get all vehicles
router.get('/vehicles', verifyToken, vehicleController.getVehiclesController);

// Get a vehicle by ID
router.get('/vehicles/:id', verifyToken, vehicleController.getVehicleByIdController);

// Update a vehicle (Admin only)
router.put('/vehicles/:id', verifyToken, verifyRole('Admin'), vehicleController.updateVehicleController);

// Toggle vehicle status (Admin only)
router.put('/vehicles/:id/toggle', verifyToken, verifyRole('Admin'), vehicleController.toggleVehicleStatusController);

module.exports = router;