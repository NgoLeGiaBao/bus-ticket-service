from fastapi import FastAPI, Depends, HTTPException, Request
from fastapi.security import HTTPBearer
from auth import verify_jwt, get_bearer_token

app = FastAPI()
security = HTTPBearer()

@app.get("/protected")
async def protected_route(token: str = Depends(get_bearer_token)):
    """Example protected endpoint"""
    try:
        payload = verify_jwt(token)
        return {"status": "success", "user": payload}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code= status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail={"error": "server_error", "description": str(e)}
        )

@app.get("/not-protected")
async def public_route():
    """Publicly accessible endpoint."""
    return {"message": "Hello, no token needed!"}