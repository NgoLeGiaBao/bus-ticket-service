const supabase = require('../supabase');

// Create a new route
const createRouteService = async (origin, destination, distance, duration, price) => {
    const { data, error } = await supabase.from('routes').insert([
        {
            origin,
            destination,
            distance,
            duration,
            price,
        }
    ]);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

// Get all routes
const getRoutesService = async () => {
    const { data, error } = await supabase.from('routes').select('*');
    if (error) {
        throw new Error(error.message);
    }

    return data;
};

// Get route by ID
const getRouteByIdService = async (id) => {
    const { data, error } = await supabase.from('routes').select('*').eq('id', id).single();
    if (error) {
        throw new Error(error.message);
    }

    return data;
};

// Update a route by ID
const updateRouteService = async (id, origin, destination, distance, duration, price) => {
    const { data, error } = await supabase.from('routes').update({
        origin,
        destination,
        distance,
        duration,
        price
    }).eq('id', id);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

// Delete a route by ID
const deleteRouteService = async (id) => {
    const { data, error } = await supabase.from('routes').delete().eq('id', id);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

module.exports = {
    createRouteService,
    getRoutesService,
    getRouteByIdService,
    updateRouteService,
    deleteRouteService,
};
