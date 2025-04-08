namespace booking_and_payment_service.services.payment {
    public class VNPaySettings
    {
        public string TmnCode { get; set; }
        public string HashSecret { get; set; }
        public string Url { get; set; }
        public string ReturnUrl { get; set; }
        public string IpnUrl { get; set; }
        public string Version { get; set; }
        public string Command { get; set; }
        public string CurrCode { get; set; }
        public string Locale { get; set; }
    }

}