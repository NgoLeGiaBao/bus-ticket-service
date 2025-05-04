export interface ProvinceResponse {
    name: string[]; 
  }
  
  // Interface cho dữ liệu điểm đến (Destinations)
  export interface DestinationResponse {
    destinations: string[];  
  }

// Interface cho dữ liệu chuyến đi (Trip)
export interface TripRoute {
  id: string;
  price: number;
  origin: string;
  distance: number;
  duration: number;
  destination: string;
}

// Interface cho dữ liệu chuyến đi (Trip)
export interface Trip {
  id: string;
  trip_date: string;
  available_seats: number;
  route_id: string;
  booked_seats: string[];
  vehicle_type: string;
  routes: TripRoute;
}

export interface RouteFormData {
  origin: string;
  destination: string;
  distance: number;
  duration: string;
  price: number;
  is_active: boolean;
};

// Routes
export interface Route {
  id: string;
  origin: string;
  destination: string;
  distance: number;
  duration: number;
  price: number;
  is_active: boolean;
}

export interface TripFormData {
  tripDate: string;                 
  availableSeats: number;           
  routeId: string;                 
  vehicle_type: string; 
  price: number;
}

// Interface cho dữ liệu chuyến đi có sẵn (Available Trip)
export type AvailableTripResponse = Trip[];
  