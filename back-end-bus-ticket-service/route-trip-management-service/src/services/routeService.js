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

// Get all destinations
const getAllDestinationsService = async () => {
    try {
        // Lấy tất cả các điểm đi (origin) và điểm đến (destination) từ bảng routes
        const { data, error } = await supabase
            .from('routes')
            .select('origin, destination');

        if (error) throw new Error(error.message);

        // Sử dụng Set để kết hợp cả điểm đi và điểm đến thành một tập hợp chung
        const combinedSet = new Set();

        // Thêm cả origin và destination vào Set
        data.forEach(route => {
            combinedSet.add(route.origin);
            combinedSet.add(route.destination);
        });

        // Trả về kết quả dưới dạng mảng
        return {
            success: true,
            message: 'All origins and destinations fetched successfully.',
            data: Array.from(combinedSet),  // Chuyển Set thành mảng
            error: null
        };
    } catch (err) {
        return {
            success: false,
            message: 'Failed to fetch all origins and destinations.',
            data: null,
            error: err.message
        };
    }
};

// Get destinations from origin
const getDestinationsFromOriginService = async (origin) => {
    try {
        // Validate required parameter
        if (!origin) {
            return {
                success: false,
                message: 'Missing required parameter: origin',
                data: null,
                error: 'Bad Request'
            };
        }

        // Query matching routes with the given origin and get all distinct destinations
        const { data: routes, error: routeError } = await supabase
            .from('routes')
            .select('destination')
            .eq('origin', origin);

        if (routeError) throw new Error(routeError.message);

        if (!routes || routes.length === 0) {
            return {
                success: true,
                message: `No routes found from ${origin}.`,
                data: [],
                error: null
            };
        }

        // Extract unique destinations (remove duplicates)
        const destinations = [...new Set(routes.map(route => route.destination))];

        return {
            success: true,
            message: `Destinations from ${origin} fetched successfully.`,
            data: destinations,
            error: null
        };
    } catch (err) {
        return {
            success: false,
            message: 'Failed to fetch destinations.',
            data: null,
            error: err.message
        };
    }
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
const updateRouteService = async (id, origin, destination, distance, duration, price, is_active) => {
    const { data, error } = await supabase.from('routes').update({
        origin,
        destination,
        distance,
        duration,
        price,
        is_active
    }).eq('id', id);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

const toggleRouteStatusService = async (id, is_active) => {
    const { data, error } = await supabase
        .from('routes')
        .update({ is_active })
        .eq('id', id);

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
    getDestinationsFromOriginService,
    getAllDestinationsService,
    toggleRouteStatusService
};
