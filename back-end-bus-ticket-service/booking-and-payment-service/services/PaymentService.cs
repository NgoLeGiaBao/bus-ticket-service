using booking_and_payment_service.data;
using booking_and_payment_service.dtos;
using booking_and_payment_service.models;
using booking_and_payment_service.responses;
using booking_and_payment_service.services.payment;

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

        public async Task<ApiResponse<Payment>> CreatePaymentAsync(PaymentRequestDto dto)
        {
            try
            {
                var booking = await _context.Bookings.FindAsync(dto.BookingId);
                if (booking == null)
                {
                    return new ApiResponse<Payment>(
                        false,
                        "Booking not found",
                        null,
                        "BookingNotFound"
                    );
                }

                var payment = new Payment
                {
                    Id = Guid.NewGuid(),
                    BookingId = dto.BookingId,
                    Amount = dto.Amount,
                    PaymentTime = DateTime.UtcNow,
                    Status = "Pending",
                    Method = dto.Method
                };

                _context.Payments.Add(payment);
                await _context.SaveChangesAsync();

                return new ApiResponse<Payment>(
                    true,
                    "Payment created successfully",
                    payment,
                    null
                );
            }
            catch (Exception ex)
            {
                return new ApiResponse<Payment>(
                    false,
                    "An error occurred while creating payment",
                    null,
                    ex.Message
                );
            }
        }

        public async Task<ApiResponse<string>> CreateVNPayPaymentUrl(Guid paymentId, string bankCode, string language, string ipAddress)
        {
            var payment = await _context.Payments.FindAsync(paymentId);
            if (payment == null)
            {
                return new ApiResponse<string>(
                    false,
                    "Payment not found",
                    "NotFound",
                    null
                );
            }

            string redirectUrl = _vnpayAdapter.CreatePaymentUrl((long)payment.Amount, bankCode, language, ipAddress, payment.Id.ToString());

            return new ApiResponse<string>(
                true,
                "VNPay payment URL created",
                redirectUrl,
                null
            );
            
        }

        public async Task<ApiResponse<string>> HandleVNPayReturn(Dictionary<string, string> parameters)
        {
            var result = _vnpayAdapter.ProcessReturn(parameters);

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
                $"Payment for {txnRef} updated",
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
    }
}
