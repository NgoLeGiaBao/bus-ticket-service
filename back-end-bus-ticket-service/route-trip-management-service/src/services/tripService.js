const supabase = require('../supabase');

// Create a new trip
const createTripService = async (tripDate, availableSeats, routeId) => {
    const { data, error } = await supabase.from('trips').insert([
        {
            trip_date: tripDate,
            available_seats: availableSeats,
            route_id: routeId,
        }
    ]);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

// Get all trips
const getTripsService = async () => {
    const { data, error } = await supabase.from('trips').select('*, routes(*)');
    if (error) {
        throw new Error(error.message);
    }

    return data;
};

// Get all trips available based on route id
const getAvailableTripsService = async (origin, destination, tripDate) => {
    try {
        // Validate required parameters
        if (!origin || !destination || !tripDate) {
            return {
                success: false,
                message: 'Missing required parameters: origin, destination, tripDate',
                data: null,
                error: 'Bad Request'
            };
        }

        // Get current date and time in UTC+7 (Vietnam timezone)
        const currentDate = new Date();
        const vietnamOffset = 7 * 60; // 7 hours in minutes
        const vietnamTime = new Date(currentDate.getTime() + vietnamOffset * 60000); // Adjust to Vietnam time
        const currentDateString = vietnamTime.toISOString().split('T')[0];
        const isToday = tripDate === currentDateString;

        // Prevent querying trips in the past
        if (tripDate < currentDateString) {
            return {
                success: false,
                message: 'Cannot fetch trips before today.',
                data: null,
                error: 'Bad Request'
            };
        }

        // Query matching routes
        const { data: routes, error: routeError } = await supabase
            .from('routes')
            .select('*')
            .eq('origin', origin)
            .eq('destination', destination);
        
        if (routeError) throw new Error(routeError.message);

        if (!routes || routes.length === 0) {
            return {
                success: true,
                message: 'No matching routes found.',
                data: [],
                error: null
            };
        }

        // Extract route IDs
        const routeIds = routes.map(route => route.id);

        // Build trip query with trip_date filter
        let tripQuery = supabase
            .from('trips')
            .select('*, routes(*)')
            .in('route_id', routeIds)
            .gte('trip_date', `${tripDate}T00:00:00`) 
            .lt('trip_date', `${tripDate}T23:59:59`);

        // If searching for today’s trips, exclude those within the next hour
        if (isToday) {
            // Get current time in Vietnam timezone and add one hour
            vietnamTime.setHours(vietnamTime.getHours() + 1); 
            tripQuery = tripQuery.gte('trip_date', vietnamTime.toISOString()); 
        }

        const { data: trips, error: tripError } = await tripQuery;

        if (tripError) throw new Error(tripError.message);

        return {
            success: true,
            message: 'Available trips fetched successfully.',
            data: trips,
            error: null
        };
    } catch (err) {
        return {
            success: false,
            message: 'Failed to fetch available trips.',
            data: null,
            error: err.message
        };
    }
};

// Get a specific trip by ID
const getTripByIdService = async (id) => {
    const { data, error } = await supabase.from('trips').select('*, routes(*)').eq('id', id).single();
    
    if (error || !data) {
        throw new Error('Trip not found');
    }

    return data;
};

// Update an existing trip
const updateTripService = async (id, updates) => {
    const { data, error } = await supabase.from('trips').update(updates).eq('id', id);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

// Delete a trip by ID
const deleteTripService = async (id) => {
    const { data, error } = await supabase.from('trips').delete().eq('id', id);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

// Add booked seats to a trip
const addBookedSeats = async (tripId, newSeats) => {
  // Fetch current booked seats
  const { data: trip, error: getError } = await supabase
    .from('trips')
    .select('booked_seats')
    .eq('id', tripId)
    .single();

  if (getError) throw new Error(getError.message);

  const updatedSeats = [...trip.booked_seats, ...newSeats];

  // Update booked_seats column
  const { data, error } = await supabase
    .from('trips')
    .update({ booked_seats: updatedSeats })
    .eq('id', tripId);

  if (error) throw new Error(error.message);
  return data;
}

// Remove booked seats from a trip
const removeBookedSeats = async (tripId, seatsToRemove) => {
    // Fetch current booked seats
    const { data: trip, error: getError } = await supabase
      .from('trips')
      .select('booked_seats')
      .eq('id', tripId)
      .single();
  
    if (getError) throw new Error(getError.message);
  
    // Remove specified seats
    const updatedSeats = trip.booked_seats.filter(seat => !seatsToRemove.includes(seat));
  
    // Update booked_seats column
    const { data, error } = await supabase
      .from('trips')
      .update({ booked_seats: updatedSeats })
      .eq('id', tripId);
  
    if (error) throw new Error(error.message);
    return data;
  };

// Check if same route
const isSameRoute = async (tripId1, tripId2) => {
    const { data: trip1, error: error1 } = await supabase
        .from('trips')
        .select('route_id')
        .eq('id', tripId1)
        .single();

    if (error1 || !trip1) throw new Error(`Trip ${tripId1} not found.`);

    const { data: trip2, error: error2 } = await supabase
        .from('trips')
        .select('route_id')
        .eq('id', tripId2)
        .single();

    if (error2 || !trip2) throw new Error(`Trip ${tripId2} not found.`);
    return trip1.route_id === trip2.route_id;
};

module.exports = {
    createTripService,
    getTripsService,
    getTripByIdService,
    updateTripService,
    deleteTripService,
    addBookedSeats,
    removeBookedSeats,
    isSameRoute,
    getAvailableTripsService
};
