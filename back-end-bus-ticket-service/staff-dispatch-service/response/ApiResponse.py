from fastapi.responses import JSONResponse

class ApiResponse:
    def __init__(self, success: bool, message: str, data: dict = None, error: str = None):
        self.success = success
        self.message = message
        self.data = data
        self.error = error

    def to_response(self, status_code: int = 200):
        return JSONResponse(
            status_code=status_code,
            content={
                "success": self.success,
                "message": self.message,
                "data": self.data,
                "error": self.error,
            }
        )