export interface BookingRequest {
    phoneNumber: string;
    email: string;
    customerName: string;
    tripId: string;
    seatNumbers: string[];
    amount: number;
  }

export interface BookingResponse {
    booking: {
      id: string;
      phoneNumber: string;
      email: string;
      customerName: string;
      tripId: string;
      seatNumbers: string[];
      bookingTime: string;
      status: string;
    };
    amount: number;
    paymentUrl: string;
  }

export interface LookUpResponse {
    success: boolean;
    message: string;
    data: {
        booking: {
            id: string;
            phoneNumber: string;
            email: string;
            customerName: string;
            tripId: string;
            seatNumbers: string[];
            bookingTime: string;
            status: string;
        };
        payment: {
            id: string;
            bookingId: string;
            amount: number;
            paymentTime: string;
            status: string;
            method: string;
        };
        trip: {
            tripDate: string;
            origin: string;
            destination: string;
        };
    };
    error: string | null;
}