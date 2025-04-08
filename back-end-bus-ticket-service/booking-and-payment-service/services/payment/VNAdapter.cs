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

public string CreatePaymentUrl(long amount, string bankCode, string ipAddress,string language, string orderId)
{
    // 1. Chuẩn bị tham số
    var vnpParams = new Dictionary<string, string>
    {
        ["vnp_Version"] = "2.1.0",
        ["vnp_Command"] = "pay",
        ["vnp_TmnCode"] = "XY9GJBC5", // Mã website của bạn
        ["vnp_Amount"] = (amount * 100).ToString(), // Nhân 100 theo yêu cầu VNPay
        ["vnp_CurrCode"] = "VND",
        ["vnp_BankCode"] = bankCode ?? "",
        ["vnp_TxnRef"] = DateTime.Now.Ticks.ToString(),
        ["vnp_OrderInfo"] = orderId,
        ["vnp_OrderType"] = "other",
        ["vnp_Locale"] = "vn",
        ["vnp_ReturnUrl"] = "http://localhost:9503/api/payment/return",
        ["vnp_IpAddr"] = language, // IP thực (không dùng localhost)
        ["vnp_CreateDate"] = DateTime.Now.ToString("yyyyMMddHHmmss"),
        ["vnp_ExpireDate"] = DateTime.Now.AddMinutes(15).ToString("yyyyMMddHHmmss")
    };

    // 2. Loại bỏ tham số trống và sắp xếp
    var sortedParams = vnpParams
        .Where(p => !string.IsNullOrEmpty(p.Value))
        .OrderBy(p => p.Key)
        .ToList();

    // 3. Tạo chuỗi hash
    var hashData = new StringBuilder();
    var query = new StringBuilder();
    
    for (int i = 0; i < sortedParams.Count; i++)
    {
        var kv = sortedParams[i];
        hashData.Append($"{kv.Key}={kv.Value}");
        query.Append($"{kv.Key}={Uri.EscapeDataString(kv.Value)}");
        
        if (i < sortedParams.Count - 1)
        {
            hashData.Append("&");
            query.Append("&");
        }
    }

    // 4. Tạo chữ ký (QUAN TRỌNG)
    string secureHash = HmacSHA512("B5V47OE9SWWMCH4MORJTVRZK4GRKEN2Y", hashData.ToString());
    string secureHashU = _util.HmacSHA512("B5V47OE9SWWMCH4MORJTVRZK4GRKEN2Y", hashData.ToString());
    Console.WriteLine($"secureHash: {secureHash} - secureHashU: {secureHashU}");
    // 5. Build URL cuối cùng
    return $"https://sandbox.vnpayment.vn/paymentv2/vpcpay.html?{query}&vnp_SecureHash={secureHash}";
}

private string HmacSHA512(string key, string inputData)
{
    var hash = new StringBuilder();
    byte[] keyBytes = Encoding.UTF8.GetBytes(key);
    byte[] inputBytes = Encoding.UTF8.GetBytes(inputData);
    
    using (var hmac = new HMACSHA512(keyBytes))
    {
        byte[] hashValue = hmac.ComputeHash(inputBytes);
        foreach (byte b in hashValue)
        {
            hash.Append(b.ToString("x2"));
        }
    }
    return hash.ToString();
}

        public ApiResponse<string> ProcessReturn(Dictionary<string, string> parameters)
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
                return new ApiResponse<string>(false, "Invalid hash", null, "Hash mismatch");
            }

            string txnRef = parameters.TryGetValue("vnp_TxnRef", out var value) ? value : "Unknown";

            return new ApiResponse<string>(true, "Payment return verified", $"Transaction Ref: {txnRef}", null);
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
