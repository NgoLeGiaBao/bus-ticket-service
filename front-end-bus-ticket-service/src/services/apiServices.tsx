import { Dispatch } from "@reduxjs/toolkit";
import { ApiResponse } from "../interfaces/ApiResponse";
import { AuthResponse, LoginParams, RegisterParams, RolesForm } from "../interfaces/Auth";
import { DispatchAssignmentPayload, DispatchAssignmentStatusPayload, RouteAssignmentPayload } from "../interfaces/Dispatch";
import { BookingRequest, BookingResponse, ChangeSeatRequest, LookUpResponse } from "../interfaces/Reservation";
import { AvailableTripResponse, DestinationResponse, ProvinceResponse, Route, RouteFormData, TripFormData } from "../interfaces/RouteAndTrip";
import axios from "../utils/axiosCustomize"

//-- Identity APIs --//
// Login function
export const postLogin = async (params: LoginParams): Promise<any> => {
    try {
      const response = await axios.post<AuthResponse>("/identity/auth/login", params);
      return response
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || "Login failed");
    }
  };
  
// Register function
export const postRegister = async (params: RegisterParams): Promise<any> => {
    try {
      const response = await axios.post<AuthResponse>("/identity/auth/register", params);
      return response;
    } catch (error: any) {
      throw new Error(error?.response?.data?.message || "Registration failed");
    }
  };
  
// Logout function
export const postLogout = async (): Promise<any> => {
    try {
      const response = await axios.post<AuthResponse>("/identity/auth/logout");
      return response
    } catch (error: unknown) {
      if (error instanceof Error) {
        // Xử lý lỗi nếu có
        throw new Error(error.message || "Logout failed");
      }
      throw new Error("An unexpected error occurred");
    }
  };

// Get All Users
export const getAllUsers = async (): Promise<any> => {
  try {
    const response = await axios.get<ApiResponse<any>>("/identity/user/get-all-users");
    return response
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch users");
  }
}

// Get All User With Roles Driver and Conductor
export const getAllUsersWithRolesDriverAndConductor = async (): Promise<any> => {
  try {
    const response = await axios.get<ApiResponse<any>>("/identity/user/get-all-user-with-roles-driver");
    return response
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch users");
  }
}

// Get All Role
export const getAllRoles = async (): Promise<any> => {
  try {
    const response = await axios.get<ApiResponse<any>>("/identity/roles");
    return response
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch roles");
  }
}

// Create Roles
export const createRole = async (data: RolesForm): Promise<any> => {
  try {
    const response = await axios.post<ApiResponse<any>>('/identity/roles', data);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to create role');
  }
};

// Update Roles
export const updateRole = async (id: string, data: RolesForm): Promise<any> => {
  try {
    const response = await axios.put<ApiResponse<any>>(`/identity/roles/${id}`, data);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to update role');
  }
};

// Delete Roles
export const deleteRole = async (id: string): Promise<any> => {
  try {
    const response = await axios.delete<ApiResponse<any>>(`/identity/roles/${id}`);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to delete role');
  }
};

export const settingRoles = async(userId: string, roleId: string, isAssign: boolean): Promise<any> => {
  try {
    if (isAssign) {
      const response = await axios.post<ApiResponse<any>>(`/identity/roles/assign/${userId}/${roleId}`);
      return response;
    } else {
      const response = await axios.delete<ApiResponse<any>>(`/identity/roles/remove/${userId}/${roleId}`);
      return response
    }
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to update role');
  }
}


//-- Journey APIs --//
// Get All Provinces (API to fetch provinces data)
export const getAllDestinations = async (): Promise<any> => {
  try {
    const response = await axios.get<ApiResponse<ProvinceResponse>>("/journeys/destinations/all");
    return response
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch provinces");
  }
};

// Get Specific Destination based on origin (API to fetch destination data by origin)
export const getDestinationsByOrigin = async (origin: string): Promise<any> => {
  try {
    const response = await axios.get<ApiResponse<DestinationResponse>>(`/journeys/destinations?origin=${origin}`);
    return response; 
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch destinations");
  }
};

// Get available trips
export const getAvailableTrips = async (from: string, to: string, tripDate: string): Promise<any> => {
  try {
    const response = await axios.get<ApiResponse<AvailableTripResponse>>(`/journeys/available-trips`, {
      params: {
        from,
        to,
        tripDate,
      },
    });
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch available trips");
  }
};

// Get all trips
export const getAllTrips = async (): Promise<any> => {
  try {
    const response = await axios.get<ApiResponse<AvailableTripResponse>>(`/journeys/trips`);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch trips");
  }
};

// Get trip by ID
export const getTripById = async (tripId: string): Promise<any> => {
  try {
    const response = await axios.get<ApiResponse<AvailableTripResponse>>(`/journeys/trips/${tripId}`);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch trip details");
  }
};

// Get trip(s) by Route ID
export const getTripByRouteId = async(routeId: string): Promise<any> => {
  try {
    const response = await axios.get<ApiResponse<Array<AvailableTripResponse>>>(`/journeys/trips/route/${routeId}`);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch trip details");
  }
}

// Get all routes
export const getAllRoutes = async (): Promise<any> => {
  try {
    const response = await axios.get<ApiResponse<Route>>(`/journeys/routes`);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch routes");
  }
}

// Create a route
export const createRoute = async (data: RouteFormData): Promise<any> => {
  try {
    const response = await axios.post<ApiResponse<any>>('/journeys/routes', data);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to create trip');
  }
};

// Create a trip
export const createTrip = async (data: TripFormData): Promise<any> => {
  try {
    const response = await axios.post<ApiResponse<any>>('/journeys/trips', data);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to create trip');
  }
}

// Update a route
export const updateRoute = async (id: string, routeData: Omit<RouteFormData, 'id'>): Promise<any> => {
  try {
    const response = await axios.put(`/journeys/routes/${id}`, routeData);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Không thể cập nhật tuyến');
  }
};

// Toggle route status
export const toggleRouteStatus = async (id: string, is_active: boolean): Promise<any> => {
  try {
    const response = await axios.put(`/journeys/routes/${id}/toggle`, { is_active });
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Không thể cập nhật trạng thái tuyến');
  }
};

// Update trip status
export const updateTripStatus = async (id: string, status: string): Promise<any> => {
  try {
    const response = await axios.put(`/journeys/trips/${id}/status`, { status });
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Không thể cập nhật trạng thái chuyến xe');
  }
};

// Get route by ID
export const getRouteById = async (id: string): Promise<any> => {
  try {
    const response = await axios.get<ApiResponse<Route>>(`/journeys/routes/${id}`);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch route details");
  }
}



//-- Reservation APIs --//
// Create a new booking
export const createBooking = async (
  payload: BookingRequest
): Promise<any> => {
  try {
    const response = await axios.post<ApiResponse<BookingResponse>>(`/reservations/bookings`, payload);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to create booking');
  }
};

export const supportedBooking = async (payload: BookingRequest): Promise<any> => {
  try {
    const response = await axios.post<ApiResponse<BookingResponse>>(`/reservations/bookings/create`,payload);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch supported booking');
  }
}

// Get booking by ID
export const lookupTicket = async (phoneNumber: string, bookingId: string): Promise<any> => {
  try {
      const response = await axios.get<ApiResponse<LookUpResponse>>(`/reservations/bookings/lookup`, {
          params: {
              phoneNumber,
              bookingId
          }
      });
      return response;
  } catch (error) {
      throw new Error('An error occurred while fetching the booking details.');
  }
};

// Get booking by Number phone
export const lookupTicketByPhone = async (phoneNumber: string): Promise<any> => {
  try {
      const response = await axios.get<ApiResponse<LookUpResponse>>(`/reservations/bookings/lookup-phone`, {
          params: {
              phoneNumber
          }
      });
      return response;
  } catch (error) {
      throw new Error('An error occurred while fetching the booking details.');
  }
}

// Get All Ticket
export const getAllBookings = async (): Promise<any> => {
  try {
    const response = await axios.get<ApiResponse<BookingResponse>>(`/reservations/bookings/all-tickets`);
    return response;
  } catch (error) {
    throw new Error('An error occurred while fetching the booking details.');
  }
}

// Change seat
export const changeSeatRequestFromCustomer = async (data: ChangeSeatRequest) => {
  try {
    const response = await axios.post('/reservations/bookings/change-seat', data);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Change seat request failed:', error);
    return { success: false, error: error.response?.data || error.message };
  }
};

// Confirm payment
export const updatePaymentStatusSuccess = async (bookingId: string) => {
  try {
    const response = await axios.put(`/reservations/payment/update-status/${bookingId}`);
    return { success: true, data: response.data };
  } catch (error: any) {
    console.error('Update payment status failed:', error);
    return { success: false, error: error.response?.data || error.message };
  }
};


//-- Staff Dispatch Assignments APIs
// Get all staff routes
export const getAllStaffRoutes = async (): Promise<any> => {
  try {
    const response = await axios.get<ApiResponse<any>>('/dispatch-assignments/staff_routes');
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch staff routes');
  }
}

// Assgin user staff routes
export const createAssignUserToRoute = async (payload: RouteAssignmentPayload) => {
  try {
    const response = await axios.post('dispatch-assignments/staff_routes', payload); 
    return response;
  } catch (error) {
    console.error('Failed to assign user to route:', error);
    throw error;
  }
};

// Update staff route status
export const updateAssignUserToRoute = async (id: string, payload: RouteAssignmentPayload) => {
  try {
    const response = await axios.put(`dispatch-assignments/staff_routes/${id}`, payload);
    return response;
  } catch (error) {
    console.error('Failed to update staff route:', error);
    throw error;
  }
}

// Get all dispatch assignments
export const getAllDispatchAssignments = async (): Promise<any> => {
  try {
    const response = await axios.get<ApiResponse<any>>('/dispatch-assignments/dispatch_assignments');
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch dispatch assignments');
  }
}

// Create a dispatch assignment
export const createDispatchAssignment = async (payload: DispatchAssignmentPayload): Promise<any> => {
  try {
    const response = await axios.post<ApiResponse<any>>('/dispatch-assignments/dispatch_assignments', payload);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to create dispatch assignment');
  }
}

// Update a dispatch assignment
export const updateDispatchAssignmentStatus = async (id: string, payload: DispatchAssignmentStatusPayload): Promise<any> => {
  try {
    const response = await axios.put<ApiResponse<any>>(`/dispatch-assignments/dispatch_assignments/${id}/status`, payload);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to update dispatch assignment');
  }
}

//-- Vehicle APIs --//
// Get all vehicles
export const getAllVehicles = async (): Promise<any> => {
  try {
    const response = await axios.get<ApiResponse<any>>('/vehicles/vehicles');
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch vehicles');
  }
}

// Get vehicle by ID
export const getVehicleById = async (id: string): Promise<any> => {
  try {
    const response = await axios.get<ApiResponse<any>>(`/vehicles/vehicles/${id}`);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to fetch vehicle details');
  }
}

// Create a vehicle
export const createVehicle = async (payload: VehicleFormData): Promise<any> => {
  try {
    const response = await axios.post<ApiResponse<any>>('/vehicles/vehicles', payload);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to create vehicle');
  }
}

// Update a vehicle
export const updateVehicle = async (id: string, payload: VehicleFormData): Promise<any> => {
  try {
    const response = await axios.put<ApiResponse<any>>(`/vehicles/vehicles/${id}`, payload);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to update vehicle');
  }
}

// Toggle vehicle status
export const toggleVehicleStatus = async (id: string): Promise<any> => {
  try {
    const response = await axios.put<ApiResponse<any>>(`/vehicles/vehicles/${id}/status`);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || 'Failed to toggle vehicle status');
  }
}