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
  