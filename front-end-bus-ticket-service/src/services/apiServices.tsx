import { ApiResponse } from "../interfaces/ApiResponse";
import { AuthResponse, LoginParams, RegisterParams } from "../interfaces/Auth";
import { BookingRequest, BookingResponse, LookUpResponse } from "../interfaces/Reservation";
import { AvailableTripResponse, DestinationResponse, ProvinceResponse } from "../interfaces/RouteAndTrip";
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

// Get trip by ID
export const getTripById = async (tripId: string): Promise<any> => {
  try {
    const response = await axios.get<ApiResponse<AvailableTripResponse>>(`/journeys/trips/${tripId}`);
    return response;
  } catch (error: any) {
    throw new Error(error?.response?.data?.message || "Failed to fetch trip details");
  }
};

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
