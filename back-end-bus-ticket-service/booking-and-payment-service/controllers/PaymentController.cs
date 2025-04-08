using booking_and_payment_service.dtos;
using booking_and_payment_service.responses;
using booking_and_payment_service.services;
using Microsoft.AspNetCore.Mvc;
using webbanxe.Payments;
using Microsoft.AspNetCore.Http;

namespace booking_and_payment_service.controllers
{
    [ApiController]
    [Route("api/payment")]
    public class PaymentController : ControllerBase
    {
        private readonly PaymentService _paymentService;

        public PaymentController(PaymentService paymentService)
        {
            _paymentService = paymentService;
        }

        [HttpPost]
        public async Task<IActionResult> CreatePayment([FromBody] PaymentRequestDto dto)
        {
            var result = await _paymentService.CreatePaymentAsync(dto);
            return StatusCode(result.Success ? 200 : 400, result);
        }

        [HttpPost("vnpay-url")]
        public async Task<IActionResult> CreateVNPayUrl(
            [FromQuery] Guid paymentId,
            [FromQuery] string bankCode,
            [FromQuery] string language)
        {
            var ipAddress = HttpContext.Connection.RemoteIpAddress?.ToString();
            var result = await _paymentService.CreateVNPayPaymentUrl(paymentId, bankCode, language, ipAddress);
            return StatusCode(result.Success ? 200 : 400, result);
        }

        [HttpGet("return")]
        public async Task<IActionResult> VNPayReturn()
        {
            var queryParams = Request.Query.ToDictionary(k => k.Key, v => v.Value.ToString());
            var result = await _paymentService.HandleVNPayReturn(queryParams);
            return StatusCode(result.Success ? 200 : 400, result);
        }

        [HttpPost("ipn")]
        public async Task<IActionResult> VNPayIPN()
        {
            var formParams = Request.Form.ToDictionary(k => k.Key, v => v.Value.ToString());
            var result = await _paymentService.HandleVNPayIPN(formParams);
            return StatusCode(result.Success ? 200 : 400, result);
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPayments()
        {
            var result = await _paymentService.GetAllPaymentsAsync();
            return Ok(result);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetPaymentById(Guid id)
        {
            var result = await _paymentService.GetPaymentByIdAsync(id);
            return StatusCode(result.Success ? 200 : 404, result);
        }

                // Updated route to use route parameters
        [HttpPost("vnpay-url-2")]
        public async Task<IActionResult> CreateVNPayUrl() // Get language from route
        {
    
            VnPay vnpay = new VnPay();
            string vnpUrl = "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html";
            string vnpApi = "http://localhost:9503/api/payment/ipn";
            string vnpTmnCode = "XY9GJBC5";
            string vnpHashSecret = "B5V47OE9SWWMCH4MORJTVRZK4GRKEN2Y";
            string vnpReturnUrl = "http://localhost:9503/api/payment/return";
            vnpay.AddRequestData("vnp_Version", "2.1.0");
            vnpay.AddRequestData("vnp_Command", "pay");
            vnpay.AddRequestData("vnp_TmnCode", vnpTmnCode);
            vnpay.AddRequestData("vnp_Amount", (100 * 10000).ToString()); //Số tiền thanh toán. Số tiền không mang các ký tự phân tách thập phân, phần nghìn, ký tự tiền tệ. Để gửi số tiền thanh toán là 100,000 VND (một trăm nghìn VNĐ) thì merchant cần nhân thêm 100 lần (khử phần thập phân), sau đó gửi sang VNPAY là: 10000000
            vnpay.AddRequestData("vnp_CreateDate", DateTime.Now.ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_CurrCode", "VND");
            vnpay.AddRequestData("vnp_Locale", "vn");
            vnpay.AddRequestData("vnp_OrderInfo", "Thanh toan don hang:");
            vnpay.AddRequestData("vnp_OrderType", "other"); //default value: other
            vnpay.AddRequestData("vnp_ExpireDate", DateTime.Now.AddMinutes(15).ToString("yyyyMMddHHmmss"));
            vnpay.AddRequestData("vnp_ReturnUrl", vnpReturnUrl);
            vnpay.AddRequestData("vnp_IpAddr", "127.0.0.1");
            vnpay.AddRequestData("vnp_TxnRef", "order.IdOrder.ToString()" + DateTime.Now.ToString("yyyyMMddHHmmss")); 

            string paymentUrl = vnpay.CreateRequestUrl(vnpUrl, vnpHashSecret);

            return Ok(paymentUrl);
        }
    }
}
