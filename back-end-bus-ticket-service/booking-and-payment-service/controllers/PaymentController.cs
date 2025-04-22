using booking_and_payment_service.dtos;
using booking_and_payment_service.responses;
using booking_and_payment_service.services;

using Microsoft.AspNetCore.Mvc;
using testvnpay.Payments;
using Microsoft.AspNetCore.Http;

namespace booking_and_payment_service.controllers
{
    [ApiController]
    [Route("payment")]
    public class PaymentController : ControllerBase
    {
        private readonly PaymentService _paymentService;

        public PaymentController(PaymentService paymentService)
        {
            _paymentService = paymentService;
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
    }
}
