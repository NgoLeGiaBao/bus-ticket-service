const supabase = require('../supabase');
const { v4: uuidv4 } = require('uuid');

// Create a new vehicle
const createVehicleService = async (licenseplate, vehiclelabel, vehicletype, brand, status, capacity, registrationdate, registrationexpirydate, yearofmanufacture, lastmaintenance, nextmaintenancedue) => {
    const id = uuidv4();

    const { data, error } = await supabase
        .from('vehicle')
        .insert([
            {
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
            }
        ])
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to create vehicle: ${error.message}`);
    }

    return data;
};

// Get all vehicles
const getVehiclesService = async () => {
    const { data, error } = await supabase
        .from('vehicle')
        .select('*');

    if (error) {
        throw new Error(`Failed to retrieve vehicles: ${error.message}`);
    }

    return data;
};

// Get vehicle by ID
const getVehicleByIdService = async (id) => {
    const { data, error } = await supabase
        .from('vehicle')
        .select('*')
        .eq('id', id)
        .maybeSingle();

    if (error) {
        throw new Error(`Failed to retrieve vehicle: ${error.message}`);
    }

    if (!data) {
        return null;
    }

    return data;
};

// Update vehicle by ID
const updateVehicleService = async (id, licenseplate, vehiclelabel, vehicletype, brand, status, capacity, registrationdate, registrationexpirydate, yearofmanufacture, lastmaintenance, nextmaintenancedue) => {
    const { data, error } = await supabase
        .from('vehicle')
        .update({
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
        })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to update vehicle: ${error.message}`);
    }

    if (!data) {
        return null;
    }

    return data;
};

// Toggle vehicle status
const toggleVehicleStatusService = async (id, status) => {
    const { data, error } = await supabase
        .from('vehicle')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

    if (error) {
        throw new Error(`Failed to update vehicle status: ${error.message}`);
    }

    if (!data) {
        return null;
    }

    return data;
};

module.exports = {
    createVehicleService,
    getVehiclesService,
    getVehicleByIdService,
    updateVehicleService,
    toggleVehicleStatusService
};