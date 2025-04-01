const supabase = require('../supabase');

const supabase = require('../config/supabase');

async function createRoute(origin, destination, distance, duration, price) {
  const { data, error } = await supabase.from('routes').insert([
    { origin, destination, distance, duration, price }
  ]);

  if (error) throw new Error(error.message);
  return data;
}

async function getRoutes() {
  const { data, error } = await supabase.from('routes').select('*');
  if (error) throw new Error(error.message);
  return data;
}

async function getRouteById(routeId) {
  const { data, error } = await supabase.from('routes').select('*').eq('id', routeId).single();
  if (error) throw new Error(error.message);
  return data;
}

async function updateRoute(routeId, updates) {
  const { data, error } = await supabase.from('routes').update(updates).eq('id', routeId);
  if (error) throw new Error(error.message);
  return data;
}

async function deleteRoute(routeId) {
  const { data, error } = await supabase.from('routes').delete().eq('id', routeId);
  if (error) throw new Error(error.message);
  return data;
}

module.exports = { createRoute, getRoutes, getRouteById, updateRoute, deleteRoute };