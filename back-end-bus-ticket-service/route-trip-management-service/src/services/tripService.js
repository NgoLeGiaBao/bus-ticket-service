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

module.exports = {
    createTripService,
    getTripsService,
    getTripByIdService,
    updateTripService,
    deleteTripService,
    addBookedSeats,
    removeBookedSeats
};
