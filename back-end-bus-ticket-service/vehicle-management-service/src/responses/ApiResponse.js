class ApiResponse {
    constructor(success, message, data, error = null) {
      this.success = success;
      this.message = message;
      this.data = data;
      this.error = error;
    }
  }
  
  module.exports = ApiResponse;