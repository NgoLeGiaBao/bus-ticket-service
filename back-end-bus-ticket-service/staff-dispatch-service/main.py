from fastapi import FastAPI, Depends
from auth.dependencies import verify_token, check_role
from api.dispatch_routes import router as dispatch_router
app = FastAPI()

# Public endpoint (no auth required)
@app.get("/")
def read_root():
    return {"message": "Welcome to Bus Ticket Service"}

# Protected endpoint - requires valid JWT
@app.get("/secure-data")
def secure_data(user_data: dict = Depends(verify_token)):
    return {
        "message": "This is a protected API",
        "user_data": user_data
    }

# Admin-only endpoint
@app.get("/secure-data-admin")
def admin_data(user_data: dict = Depends(check_role("admin"))):
    return {
        "message": "Admin-only resource",
        "user_data": user_data
    }

# Dispatcher-only endpoint
@app.get("/dispatch/assign")
def assign_dispatch(user_data: dict = Depends(check_role("dispatcher"))):
    return {
        "message": "Dispatch assignment processed",
        "user_data": user_data
    }

app.include_router(dispatch_router)