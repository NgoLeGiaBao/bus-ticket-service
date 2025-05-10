const vehicleService = require('../services/vehicleService');
const ApiResponse = require('../responses/ApiResponse');

// Create a new vehicle
const createVehicleController = async (req, res) => {
    const { licenseplate, vehiclelabel, vehicletype, brand, status, capacity, registrationdate, registrationexpirydate, yearofmanufacture, lastmaintenance, nextmaintenancedue } = req.body;

    try {
        const vehicle = await vehicleService.createVehicleService(
            licenseplate,
            vehiclelabel,
            vehicletype,
            brand,
            status,
            capacity,
            registrationdate,
            registrationexpirydate,
            yearofmanufacture,
            lastmaintenance,
            nextmaintenancedue
        );
        res.status(201).json(new ApiResponse(true, 'Vehicle created successfully', vehicle));
    } catch (error) {
        res.status(500).json(new ApiResponse(false, error.message, null, error.message));
    }
};

// Get all vehicles
const getVehiclesController = async (req, res) => {
    try {
        const vehicles = await vehicleService.getVehiclesService();
        res.status(200).json(new ApiResponse(true, 'Vehicles retrieved successfully', vehicles));
    } catch (error) {
        res.status(500).json(new ApiResponse(false, error.message, null, error.message));
    }
};

// Get vehicle by ID
const getVehicleByIdController = async (req, res) => {
    const { id } = req.params;

    try {
        const vehicle = await vehicleService.getVehicleByIdService(id);
        if (vehicle) {
            res.status(200).json(new ApiResponse(true, 'Vehicle retrieved successfully', vehicle));
        } else {
            res.status(404).json(new ApiResponse(false, 'Vehicle not found', null));
        }
    } catch (error) {
        res.status(500).json(new ApiResponse(false, error.message, null, error.message));
    }
};

// Update vehicle by ID
const updateVehicleController = async (req, res) => {
    const { id } = req.params;
    const { licenseplate, vehiclelabel, vehicletype, brand, status, capacity, registrationdate, registrationexpirydate, yearofmanufacture, lastmaintenance, nextmaintenancedue } = req.body;

    try {
        const updatedVehicle = await vehicleService.updateVehicleService(
            id,
            licenseplate,
            vehiclelabel,
            vehicletype,
            brand,
            status,
            capacity,
            registrationdate,
            registrationexpirydate,
            yearofmanufacture,
            lastmaintenance,
            nextmaintenancedue
        );
        if (updatedVehicle) {
            res.status(200).json(new ApiResponse(true, 'Vehicle updated successfully', updatedVehicle));
        } else {
            res.status(404).json(new ApiResponse(false, 'Vehicle not found', null));
        }
    } catch (error) {
        res.status(500).json(new ApiResponse(false, error.message, null, error.message));
    }
};

// Toggle vehicle status
const toggleVehicleStatusController = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        const updatedVehicle = await vehicleService.toggleVehicleStatusService(id, status);
        if (updatedVehicle) {
            res.status(200).json(new ApiResponse(true, 'Vehicle status updated successfully', updatedVehicle));
        } else {
            res.status(404).json(new ApiResponse(false, 'Vehicle not found', null));
        }
    } catch (error) {
        res.status(500).json(new ApiResponse(false, error.message, null, error.message));
    }
};

module.exports = {
    createVehicleController,
    getVehiclesController,
    getVehicleByIdController,
    updateVehicleController,
    toggleVehicleStatusController
};