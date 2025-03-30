namespace route_and_trip_management_service.Helpers
{
    public class ApiResponse<T>
    {
        public bool Success { get; set; }
        public string Message { get; set; }
        public T? Data { get; set; }
        public Dictionary<string, string>? Errors { get; set; }

        public ApiResponse(bool success, string message, T? data = default, Dictionary<string, string>? errors = null)
        {
            Success = success;
            Message = message;
            Data = data;
            Errors = errors;
        }

        public static ApiResponse<T> SuccessResponse(T data, string message = "Request successful")
        {
            return new ApiResponse<T>(true, message, data);
        }

        public static ApiResponse<T> ErrorResponse(string message, Dictionary<string, string>? errors = null)
        {
            return new ApiResponse<T>(false, message, default, errors);
        }
    }
}