const supabase = require('../supabase');

// Create a new route
const createRouteService = async (origin, destination, distance, duration, price, subroutes = []) => {
    // Chèn vào bảng routes
    const { data: routeData, error: routeError } = await supabase
        .from('routes')
        .insert([
            {
                origin,
                destination,
                distance,
                duration,
                price,
                is_active: true
            }
        ])
        .select('id')
        .single();

    if (routeError) {
        throw new Error(routeError.message);
    }

    const newRouteId = routeData.id;

    // Insert subroutes
    if (subroutes.length > 0) {
        const subRoutesToInsert = subroutes.map(subroute => ({
            parentrouteid: newRouteId,
            relatedrouteid: subroute.relatedrouteid || null,
            sortorder: subroute.sortorder,
            isactive: subroute.isactive ?? true
        }));

        const { data: subRouteData, error: subRouteError } = await supabase
            .from('subroutes')
            .insert(subRoutesToInsert)
            .select('id');

        if (subRouteError) {
            throw new Error(subRouteError.message);
        }

        return { route: routeData, subroutes: subRouteData };
    }

    return { route: routeData, subroutes: [] };
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
    const { data, error } = await supabase
        .from('routes')
        .select(`
            id,
            origin,
            destination,
            distance,
            duration,
            price,
            is_active,
            subroutes:subroutes!fk_parent_route (
                id,
                parentrouteid,
                relatedrouteid,
                sortorder,
                isactive
            )
        `);

    if (error) {
        console.error('Error fetching routes:', error);
        throw new Error(`Không thể tải danh sách tuyến: ${error.message}`);
    }

    // Transform data to match the Route interface
    const transformedData = data.map((route) => ({
        id: route.id,
        origin: route.origin,
        destination: route.destination,
        distance: route.distance,
        duration: route.duration.toString(), // Convert duration to string
        price: route.price,
        is_active: route.is_active,
        subroutes: route.subroutes.map((subroute) => ({
            id: subroute.id,
            relatedrouteid: subroute.relatedrouteid || '',
            sortorder: subroute.sortorder,
            isactive: subroute.isactive,
        })),
    }));

    return transformedData;
};

// Get route by ID
const getRouteByIdService = async (id) => {
    const { data, error } = await supabase
        .from('routes')
        .select(`
            id,
            origin,
            destination,
            distance,
            duration,
            price,
            is_active,
            subroutes:subroutes!fk_parent_route (
                id,
                parentrouteid,
                relatedrouteid,
                sortorder,
                isactive
            )
        `)
        .eq('id', id)
        .maybeSingle(); // Use maybeSingle instead of single

    if (error) {
        console.error('Error fetching route by ID:', error);
        throw new Error(`Không thể tải tuyến: ${error.message}`);
    }

    if (!data) {
        throw new Error('Tuyến không tồn tại');
    }

    // Transform data to match the Route interface
    const transformedData = {
        id: data.id,
        origin: data.origin,
        destination: data.destination,
        distance: data.distance,
        duration: data.duration.toString(), 
        price: data.price,
        is_active: data.is_active,
        subroutes: data.subroutes.map((subroute) => ({
            id: subroute.id,
            relatedrouteid: subroute.relatedrouteid || '',
            sortorder: subroute.sortorder,
            isactive: subroute.isactive,
        })),
    };

    return transformedData;
};

// Update a route by ID
const updateRouteService = async (id, origin, destination, distance, duration, price, is_active, subroutes = []) => {
    // Thử upsert (update hoặc insert) vào bảng routes
    const { data: routeData, error: routeError } = await supabase
        .from('routes')
        .upsert([
            {
                id: id || undefined, // Nếu không có id, sẽ chèn mới
                origin,
                destination,
                distance,
                duration,
                price,
                is_active: is_active ?? true
            }
        ], { onConflict: 'id' })
        .select('id')
        .single();

    if (routeError) {
        throw new Error(routeError.message);
    }

    const routeId = routeData.id;

    // Xóa tất cả subroutes hiện có liên quan đến route này
    const { error: deleteError } = await supabase
        .from('subroutes')
        .delete()
        .eq('parentrouteid', routeId);

    if (deleteError) {
        throw new Error(deleteError.message);
    }

    // Chèn các subroutes mới nếu có
    let subRouteData = [];
    if (subroutes.length > 0) {
        const subRoutesToInsert = subroutes.map(subroute => ({
            parentrouteid: routeId,
            relatedrouteid: subroute.relatedrouteid || null,
            sortorder: subroute.sortorder,
            isactive: subroute.isactive ?? true
        }));

        const { data, error: insertError } = await supabase
            .from('subroutes')
            .insert(subRoutesToInsert)
            .select('id');

        if (insertError) {
            throw new Error(insertError.message);
        }
        subRouteData = data;
    }

    // Lấy lại danh sách subroutes sau khi chèn
    const { data: updatedSubroutes, error: finalError } = await supabase
        .from('subroutes')
        .select('id, relatedrouteid, sortorder, isactive')
        .eq('parentrouteid', routeId);

    if (finalError) {
        throw new Error(finalError.message);
    }

    return { route: routeData, subroutes: updatedSubroutes };
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
