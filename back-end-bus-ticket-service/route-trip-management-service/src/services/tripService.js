const supabase = require('../supabase');

// Create a new trip
const createTripService = async (tripDate, availableSeats, routeId, price, vehicle_type) => {
    const { data, error } = await supabase.from('trips').insert([
        {
            trip_date: tripDate,
            available_seats: availableSeats,
            route_id: routeId,
            price: price,
            vehicle_type: vehicle_type
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
        error: 'Bad Request',
      };
    }

    // Get current date and time in UTC
    const currentDate = new Date();
    const vietnamOffset = 7 * 60; // 7 hours in minutes
    const vietnamTime = new Date(currentDate.getTime() + vietnamOffset * 60000); 
    const currentDateString = vietnamTime.toISOString().split('T')[0];
    const isToday = tripDate === currentDateString;

    // Prevent querying trips in the past
    if (tripDate < currentDateString) {
      return {
        success: false,
        message: 'Cannot fetch trips before today.',
        data: null,
        error: 'Bad Request',
      };
    }


    // Step 1: Find the current route's ID
    const { data: currentRoute, error: currentRouteError } = await supabase
      .from('routes')
      .select('id')
      .eq('origin', origin)
      .eq('destination', destination)
      .single();


    if (currentRouteError || !currentRoute) {
      throw new Error(`Không thể tìm tuyến hiện tại: ${currentRouteError?.message || 'Route not found'}`);
    }

    const currentRouteId = currentRoute.id;

    // Step 2: Find subroutes where the current route is a relatedrouteid
    const { data: subRoutes, error: subRouteError } = await supabase
      .from('subroutes')
      .select('parentrouteid')
      .eq('relatedrouteid', currentRouteId)
      .eq('isactive', true);


    // Step 3: Get parent routes (without subroutes)
    const parentRouteIds = subRoutes.map((subRoute) => subRoute.parentrouteid);
    const { data: routes, error: routeError } = await supabase
      .from('routes')
      .select('id, origin, destination, distance, duration, price, is_active')
      .in('id', parentRouteIds)
      .eq('is_active', true);

    if (routeError) {
      throw new Error(`Không thể tải tuyến cha: ${routeError.message}`);
    }

    // Step 4: Collect parent route IDs
    const routeIds = routes.map((route) => route.id);
    if (!routeIds.includes(currentRoute.id)) {
      routeIds.push(currentRoute.id);
    }

    // Step 5: Fetch trips for parent routes
    let tripQuery = supabase
      .from('trips')
      .select(
        `
        *,
        routes (
          id,
          origin,
          destination,
          distance,
          duration,
          price,
          is_active
        )
      `
      )
      .in('route_id', routeIds)
      .gte('trip_date', `${tripDate}T00:00:00`)
      .lt('trip_date', `${tripDate}T23:59:59`)
      .in('status', ['scheduled', 'ongoing']);

    // If searching for today’s trips, exclude those within the next hour
    if (isToday) {
      const oneHourLater = new Date(currentDate.getTime() + 60 * 60 * 1000); // Add 1 hour
      tripQuery = tripQuery.gte('trip_date', oneHourLater.toISOString());
    }

    const { data: trips, error: tripError } = await tripQuery;

    if (tripError) {
      throw new Error(`Không thể tải chuyến: ${tripError.message}`);
    }


    return {
      success: true,
      message: 'Available trips for parent routes fetched successfully.',
      data: trips || [],
      error: null,
    };
  } catch (err) {
    console.error('Error in getAvailableTripsService:', err.message); // Log error
    return {
      success: false,
      message: 'Failed to fetch available trips for parent routes.',
      data: null,
      error: err.message,
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
    // Fetch current booked seats and available seats
    const { data: trip, error: getError } = await supabase
      .from('trips')
      .select('booked_seats, available_seats')
      .eq('id', tripId)
      .single();
  
    if (getError) throw new Error(getError.message);
  
    const updatedBookedSeats = [...trip.booked_seats, ...newSeats];
    const updatedAvailableSeats = trip.available_seats - newSeats.length;
  
    if (updatedAvailableSeats < 0) {
      throw new Error("Not enough available seats");
    }
  
    // Update both columns
    const { data, error } = await supabase
      .from('trips')
      .update({
        booked_seats: updatedBookedSeats,
        available_seats: updatedAvailableSeats,
      })
      .eq('id', tripId);
  
    if (error) throw new Error(error.message);
    return data;
};

// Remove booked seats from a trip
const removeBookedSeats = async (tripId, seatsToRemove) => {
    // Fetch current booked seats and available seats
    const { data: trip, error: getError } = await supabase
      .from('trips')
      .select('booked_seats, available_seats')
      .eq('id', tripId)
      .single();
  
    if (getError) throw new Error(getError.message);
  
    const updatedBookedSeats = trip.booked_seats.filter(seat => !seatsToRemove.includes(seat));
    const updatedAvailableSeats = trip.available_seats + seatsToRemove.length;
  
    // Update both columns
    const { data, error } = await supabase
      .from('trips')
      .update({
        booked_seats: updatedBookedSeats,
        available_seats: updatedAvailableSeats,
      })
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

// Get trip by route id
const getTripsByRouteIdService = async (routeId) => {
    const { data, error } = await supabase
        .from('trips')
        .select('*, routes(*)')
        .eq('route_id', routeId);

    if (error) {
        throw new Error(error.message);
    }

    return data;
};

// Update trip status
const updateTripStatusService = async (id, status) => {
    const { data, error } = await supabase
        .from('trips')
        .update({ status })
        .eq('id', id);

    if (error) {
        throw new Error(error.message);
    }

    return data;
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
    getAvailableTripsService,
    getTripsByRouteIdService,
    updateTripStatusService
};
