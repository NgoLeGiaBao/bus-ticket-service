using booking_and_payment_service.responses;
using Microsoft.Extensions.Options;
using System.Web;
using System.Text;
using System.Security.Cryptography;


namespace booking_and_payment_service.services.payment
{
    public class VNPayAdapter
    {
        private readonly VNPayUtil _util;
        private readonly VNPaySettings _settings;

        public VNPayAdapter(VNPayUtil util, IOptions<VNPaySettings> options)
        {
            _util = util;
            _settings = options.Value;
        }

        public ApiResponse<Dictionary<string, string>> ProcessReturn(Dictionary<string, string> parameters)
        {
            return new ApiResponse<Dictionary<string, string>>(true, "Return processed successfully", parameters, null);
        }

        public ApiResponse<string> ProcessIPN(Dictionary<string, string> parameters)
        {
            if (!parameters.TryGetValue("vnp_SecureHash", out var receivedHash))
            {
                return new ApiResponse<string>(false, "Missing hash", null, "vnp_SecureHash not found");
            }

            parameters.Remove("vnp_SecureHash");
            parameters.Remove("vnp_SecureHashType");

            string calculatedHash = _util.HashAllFields(parameters, _settings.HashSecret);
            if (receivedHash != calculatedHash)
            {
                return new ApiResponse<string>(false, "Invalid IPN hash", null, "Hash mismatch");
            }

            string txnRef = parameters.TryGetValue("vnp_TxnRef", out var value) ? value : "Unknown";

            return new ApiResponse<string>(true, "IPN processed successfully", $"TxnRef: {txnRef}", null);
        }
    }
}
