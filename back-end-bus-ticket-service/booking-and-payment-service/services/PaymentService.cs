using booking_and_payment_service.data;
using booking_and_payment_service.dtos;
using booking_and_payment_service.models;
using booking_and_payment_service.responses;
using booking_and_payment_service.services.payment;
using testvnpay.Payments;

using Microsoft.EntityFrameworkCore;

namespace booking_and_payment_service.services
{
    public class PaymentService
    {
        private readonly UserDbContext _context;
        private readonly VNPayAdapter _vnpayAdapter;

        public PaymentService(UserDbContext context, VNPayAdapter vnpayAdapter)
        {
            _context = context;
            _vnpayAdapter = vnpayAdapter;
        }

        public async Task<ApiResponse<string>> HandleVNPayReturn(Dictionary<string, string> parameters)
        {
            var result = _vnpayAdapter.ProcessReturn(parameters);

            if (!result.Success)
            {
                return new ApiResponse<string>(
                    false,
                    result.Message,
                    "VNPayValidationFailed",
                    null
                );
            }

            // Get parameters
            var parsedParams = result.Data;

            string bookingId = parsedParams["vnp_TxnRef"];

            // Get payment followed by booking
            var payment = await _context.Payments.FirstOrDefaultAsync(p => p.BookingId == bookingId);
            if (payment == null)
            {
                return new ApiResponse<string>(
                    false,
                    "Payment not found",
                    "InvalidBookingId",
                    null
                );
            }

            // Get booking
            var booking = await _context.Bookings.FindAsync(bookingId);
            if (booking == null)
            {
                return new ApiResponse<string>(
                    false,
                    "Booking not found",
                    "InvalidBookingId",
                    null
                );
            }

            // Update payment
            if (parsedParams["vnp_ResponseCode"] == "00" && parsedParams["vnp_TransactionStatus"] == "00")
            {
                payment.Status = "Success";
                payment.Method = "vnpay";
                payment.PaymentTime = DateTime.UtcNow;

                booking.Status = "Booked";

                await _context.SaveChangesAsync();
            }

            return new ApiResponse<string>(
                true,
                $"Payment and booking for {bookingId} updated",
                null,
                null
            );
        }

        public async Task<ApiResponse<string>> HandleVNPayIPN(Dictionary<string, string> parameters)
        {
            var result = _vnpayAdapter.ProcessIPN(parameters);

            if (!result.Success) return result;

            string txnRef = parameters["vnp_TxnRef"];
            var payment = await _context.Payments.FindAsync(Guid.Parse(txnRef));
            if (payment == null)
            {
                return new ApiResponse<string>(
                    false,
                    "Payment not found",
                    "InvalidTxnRef",
                    null
                );
            }

            if (parameters["vnp_ResponseCode"] == "00" && parameters["vnp_TransactionStatus"] == "00")
            {
                payment.Status = "Paid";
                payment.PaymentTime = DateTime.UtcNow;
                await _context.SaveChangesAsync();
            }

            return new ApiResponse<string>(
                true,
                "IPN processed successfully",
                null,
                null
            );
        }

        public async Task<ApiResponse<List<Payment>>> GetAllPaymentsAsync()
        {
            var payments = await _context.Payments.ToListAsync();
            return new ApiResponse<List<Payment>>(
                true,
                "List of payments",
                payments,
                null
            );
        }

        public async Task<ApiResponse<Payment>> GetPaymentByIdAsync(Guid id)
        {
            var payment = await _context.Payments.FindAsync(id);
            if (payment == null)
            {
                return new ApiResponse<Payment>(
                    false,
                    "Payment not found",
                    null,
                    "NotFound"
                );
            }

            return new ApiResponse<Payment>(
                true,
                "Payment found",
                payment,
                null
            );
        }

        public async Task<ApiResponse<Payment>> UpdatePaymentStatusAsync(string bookingId)
        {
            var payment = await _context.Payments.FirstOrDefaultAsync(p => p.BookingId == bookingId);
            if (payment == null)
            {
                return new ApiResponse<Payment>(
                    false,
                    "Payment not found",
                    null,
                    "NotFound"
                );
            }

            payment.Status = "Success";
            await _context.SaveChangesAsync();

            return new ApiResponse<Payment>(
                true,
                "Payment updated",
                payment,
                null
            );
        }
    }
}
