// const supabase  = require('../supabase');

// // Create a new trip
// async function createTrip(tripDate, availableSeats, routeId) {
//   const { data, error } = await supabase.from('trips').insert([
//     { trip_date: tripDate, available_seats: availableSeats, route_id: routeId }
//   ]);

//   if (error) throw new Error(error.message);
//   return data;
// }

// // Get all trips
// async function getTrips() {
//   const { data, error } = await supabase.from('trips').select('*, routes(*)');
//   if (error) throw new Error(error.message);
//   return data;
// }

// // Get a specific trip by ID
// async function getTripById(tripId) {
//   const { data, error } = await supabase.from('trips').select('*, routes(*)').eq('id', tripId).single();
//   if (error) throw new Error(error.message);
//   return data;
// }

// // Update an existing trip
// async function updateTrip(tripId, updates) {
//   const { data, error } = await supabase.from('trips').update(updates).eq('id', tripId);
//   if (error) throw new Error(error.message);
//   return data;
// }

// // Delete a trip by ID
// async function deleteTrip(tripId) {
//   const { data, error } = await supabase.from('trips').delete().eq('id', tripId);
//   if (error) throw new Error(error.message);
//   return data;
// }

// // Add booked seats to a trip
// async function addBookedSeats(tripId, newSeats) {
//   // Fetch current booked seats
//   const { data: trip, error: getError } = await supabase
//     .from('trips')
//     .select('booked_seats')
//     .eq('id', tripId)
//     .single();

//   if (getError) throw new Error(getError.message);

//   const updatedSeats = [...trip.booked_seats, ...newSeats];

//   // Update booked_seats column
//   const { data, error } = await supabase
//     .from('trips')
//     .update({ booked_seats: updatedSeats })
//     .eq('id', tripId);

//   if (error) throw new Error(error.message);
//   return data;
// }

// module.exports = { createTrip, getTrips, getTripById, updateTrip, deleteTrip, addBookedSeats };
