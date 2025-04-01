const supabase  = require('../supabase');

async function createTrip(tripDate, availableSeats, routeId) {
  const { data, error } = await supabase.from('trips').insert([
    { trip_date: tripDate, available_seats: availableSeats, route_id: routeId }
  ]);

  if (error) throw new Error(error.message);
  return data;
}

async function getTrips() {
  const { data, error } = await supabase.from('trips').select('*, routes(*)');
  if (error) throw new Error(error.message);
  return data;
}

async function getTripById(tripId) {
  const { data, error } = await supabase.from('trips').select('*, routes(*)').eq('id', tripId).single();
  if (error) throw new Error(error.message);
  return data;
}

async function updateTrip(tripId, updates) {
  const { data, error } = await supabase.from('trips').update(updates).eq('id', tripId);
  if (error) throw new Error(error.message);
  return data;
}

async function deleteTrip(tripId) {
  const { data, error } = await supabase.from('trips').delete().eq('id', tripId);
  if (error) throw new Error(error.message);
  return data;
}

module.exports = { createTrip, getTrips, getTripById, updateTrip, deleteTrip };
