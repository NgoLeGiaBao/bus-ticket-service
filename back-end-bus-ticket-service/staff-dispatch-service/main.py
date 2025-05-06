# from fastapi import FastAPI, Depends
# from auth.dependencies import verify_token, check_role
# from api.dispatch_routes import router as dispatch_router
# app = FastAPI()

# # Public endpoint (no auth required)
# @app.get("/")
# def read_root():
#     return {"message": "Welcome to Bus Ticket Service"}

# # Protected endpoint - requires valid JWT
# @app.get("/secure-data")
# def secure_data(user_data: dict = Depends(verify_token)):
#     return {
#         "message": "This is a protected API",
#         "user_data": user_data
#     }

# # Admin-only endpoint
# @app.get("/secure-data-admin")
# def admin_data(user_data: dict = Depends(check_role("admin"))):
#     return {
#         "message": "Admin-only resource",
#         "user_data": user_data
#     }

# # Dispatcher-only endpoint
# @app.get("/dispatch/assign")
# def assign_dispatch(user_data: dict = Depends(check_role("dispatcher"))):
#     return {
#         "message": "Dispatch assignment processed",
#         "user_data": user_data
#     }

# app.include_router(dispatch_router)



from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from typing import List
from uuid import UUID
from datetime import datetime
from core.supabase_client import supabase
from fastapi.responses import JSONResponse

app = FastAPI()

# -------------------------
# Models (Schemas)
# -------------------------
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

class DispatchAssignmentBase(BaseModel):
    tripid: UUID  
    userid: UUID
    assignedate: datetime  
    expectedendtime: datetime
    role: str
    status: str

    def dict(self, **kwargs):
        result = super().dict(**kwargs)
        # Convert UUID to string
        for key, value in result.items():
            if isinstance(value, datetime):
                result[key] = value.isoformat()
            elif isinstance(value, UUID):
                result[key] = str(value)
        return result

class DispatchAssignmentCreate(DispatchAssignmentBase):
    pass

class DispatchAssignment(DispatchAssignmentBase):
    id: UUID
    createdate: datetime

    class Config:
        from_attributes = True 

class StaffRouteBase(BaseModel):
    userid: UUID
    routeid: UUID
    assigndate: datetime
    isactive: bool
    roleassignments: List[str] = Field(default=[])

    def dict(self, **kwargs):
        result = super().dict(**kwargs)
        # Convert UUID to string
        for key, value in result.items():
            if isinstance(value, UUID):
                result[key] = str(value)
            elif isinstance(value, datetime):
                result[key] = value.isoformat()
        return result

class UpdateStatusRequest(BaseModel):
    status: str

class StaffRouteCreate(StaffRouteBase):
    pass

class StaffRoute(StaffRouteBase):
    id: UUID

    class Config:
        from_attributes = True  # Updated from orm_mode in Pydantic v2

# -------------------------
# Helper Functions
# -------------------------
def handle_supabase_response(response):
    if hasattr(response, 'error') and response.error:
        raise HTTPException(status_code=400, detail=response.error.message)
    if not response.data:
        raise HTTPException(status_code=404, detail="No data found")
    return response.data


# -------------------------
# DispatchAssignments CRUD
# -------------------------
@app.post("/dispatch_assignments", response_model=DispatchAssignment)
def create_dispatch_assignment(data: DispatchAssignmentCreate):
    try:
        response = supabase.table("dispatchassignments").insert(data.dict()).execute()
        result = handle_supabase_response(response)
        return ApiResponse(
            success=True,
            message="Dispatch assignment created successfully",
            data=result[0]
        ).to_response(201)
    except HTTPException as he:
        return ApiResponse(
            success=False,
            message="Failed to create dispatch assignment",
            error=str(he.detail)
        ).to_response(he.status_code)
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to create dispatch assignment",
            error=str(e)
        ).to_response(400)

@app.get("/dispatch_assignments", response_model=List[DispatchAssignment])
def list_dispatch_assignments():
    try:
        response = supabase.table("dispatchassignments").select("*").execute()
        data = handle_supabase_response(response)
        return ApiResponse(
            success=True,
            message="Dispatch assignments retrieved successfully",
            data={"assignments": data}
        ).to_response()
    except HTTPException as he:
        return ApiResponse(
            success=False,
            message="Failed to retrieve dispatch assignments",
            error=str(he.detail)
        ).to_response(he.status_code)
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to retrieve dispatch assignments",
            error=str(e)
        ).to_response(400)

@app.get("/dispatch_assignments/{assignment_id}", response_model=DispatchAssignment)
def get_dispatch_assignment(assignment_id: UUID):
    try:
        response = supabase.table("dispatchassignments").select("*").eq("id", str(assignment_id)).single().execute()
        data = handle_supabase_response(response)
        return ApiResponse(
            success=True,
            message="Dispatch assignment retrieved successfully",
            data=data
        ).to_response()
    except HTTPException as he:
        return ApiResponse(
            success=False,
            message=f"Dispatch assignment with id {assignment_id} not found",
            error=str(he.detail)
        ).to_response(he.status_code)
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to retrieve dispatch assignment",
            error=str(e)
        ).to_response(400)

@app.put("/dispatch_assignments/{assignment_id}", response_model=DispatchAssignment)
def update_dispatch_assignment(assignment_id: UUID, data: DispatchAssignmentCreate):
    try:
        response = supabase.table("dispatchassignments").update(data.dict()).eq("id", str(assignment_id)).execute()
        result = handle_supabase_response(response)
        return ApiResponse(
            success=True,
            message="Dispatch assignment updated successfully",
            data=result[0]
        ).to_response()
    except HTTPException as he:
        return ApiResponse(
            success=False,
            message="Failed to update dispatch assignment",
            error=str(he.detail)
        ).to_response(he.status_code)
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to update dispatch assignment",
            error=str(e)
        ).to_response(400)

@app.delete("/dispatch_assignments/{assignment_id}")
def delete_dispatch_assignment(assignment_id: UUID):
    try:
        response = supabase.table("dispatchassignments").delete().eq("id", str(assignment_id)).execute()
        handle_supabase_response(response)
        return ApiResponse(
            success=True,
            message="Dispatch assignment deleted successfully"
        ).to_response()
    except HTTPException as he:
        return ApiResponse(
            success=False,
            message="Failed to delete dispatch assignment",
            error=str(he.detail)
        ).to_response(he.status_code)
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to delete dispatch assignment",
            error=str(e)
        ).to_response(400)

@app.put("/dispatch_assignments/{assignment_id}/status", response_model=DispatchAssignment)
def update_dispatch_assignment_status(assignment_id: UUID, status_data: UpdateStatusRequest):
    try:
        response = supabase.table("dispatchassignments") \
            .update({"status": status_data.status}) \
            .eq("id", str(assignment_id)) \
            .execute()
        result = handle_supabase_response(response)
        return ApiResponse(
            success=True,
            message="Dispatch assignment status updated successfully",
            data=result[0]
        ).to_response()
    except HTTPException as he:
        return ApiResponse(
            success=False,
            message="Failed to update dispatch assignment status",
            error=str(he.detail)
        ).to_response(he.status_code)
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to update dispatch assignment status",
            error=str(e)
        ).to_response(400)
    
# -------------------------
# StaffRoutes CRUD
# -------------------------
@app.post("/staff_routes", response_model=StaffRoute)
def create_staff_route(data: StaffRouteCreate):
    try:
        response = supabase.table("staffroutes").insert(data.dict()).execute()
        result = handle_supabase_response(response)
        return ApiResponse(
            success=True,
            message="Staff route created successfully",
            data=result[0]
        ).to_response(201)
    except HTTPException as he:
        return ApiResponse(
            success=False,
            message="Failed to create staff route",
            error=str(he.detail)
        ).to_response(he.status_code)
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to create staff route",
            error=str(e)
        ).to_response(400)

@app.get("/staff_routes", response_model=List[StaffRoute])
def list_staff_routes():
    try:
        response = supabase.table("staffroutes").select("*").execute()
        data = handle_supabase_response(response)
        return ApiResponse(
            success=True,
            message="Staff routes retrieved successfully",
            data={"routes": data}
        ).to_response()
    except HTTPException as he:
        return ApiResponse(
            success=False,
            message="Failed to retrieve staff routes",
            error=str(he.detail)
        ).to_response(he.status_code)
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to retrieve staff routes",
            error=str(e)
        ).to_response(400)

@app.get("/staff_routes/{route_id}", response_model=StaffRoute)
def get_staff_route(route_id: UUID):
    try:
        response = supabase.table("staffroutes").select("*").eq("id", str(route_id)).single().execute()
        data = handle_supabase_response(response)
        return ApiResponse(
            success=True,
            message="Staff route retrieved successfully",
            data=data
        ).to_response()
    except HTTPException as he:
        return ApiResponse(
            success=False,
            message=f"Staff route with id {route_id} not found",
            error=str(he.detail)
        ).to_response(he.status_code)
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to retrieve staff route",
            error=str(e)
        ).to_response(400)

@app.put("/staff_routes/{route_id}", response_model=StaffRoute)
def update_staff_route(route_id: UUID, data: StaffRouteCreate):
    try:
        response = supabase.table("staffroutes").update(data.dict()).eq("id", str(route_id)).execute()
        result = handle_supabase_response(response)
        return ApiResponse(
            success=True,
            message="Staff route updated successfully",
            data=result[0]
        ).to_response()
    except HTTPException as he:
        return ApiResponse(
            success=False,
            message="Failed to update staff route",
            error=str(he.detail)
        ).to_response(he.status_code)
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to update staff route",
            error=str(e)
        ).to_response(400)

@app.delete("/staff_routes/{route_id}")
def toggle_staff_route_active(route_id: UUID):
    try:
        # Get current record
        response = supabase.table("staffroutes").select("isactive").eq("id", str(route_id)).single().execute()
        current = handle_supabase_response(response)
        current_status = current["isactive"]

        # Toggle status
        new_status = not current_status

        # Update
        update_response = supabase.table("staffroutes").update({"isactive": new_status}).eq("id", str(route_id)).execute()
        handle_supabase_response(update_response)

        return ApiResponse(
            success=True,
            message=f"Staff route active status toggled successfully",
            data={"isactive": new_status}
        ).to_response()
    except HTTPException as he:
        return ApiResponse(
            success=False,
            message="Failed to toggle staff route active status",
            error=str(he.detail)
        ).to_response(he.status_code)
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to toggle staff route active status",
            error=str(e)
        ).to_response(400)
    
@app.get("/staff_routes/by_route/{route_id}", response_model=List[StaffRoute])
def get_active_staff_routes_by_route_id(route_id: UUID):
    try:
        response = supabase.table("staffroutes") \
            .select("*") \
            .eq("routeid", str(route_id)) \
            .execute()
        data = handle_supabase_response(response)
        return ApiResponse(
            success=True,
            message="Staff routes retrieved successfully",
            data={"routes": data}
        ).to_response()
    except HTTPException as he:
        return ApiResponse(
            success=False,
            message="Failed to retrieve staff routes by route ID",
            error=str(he.detail)
        ).to_response(he.status_code)
    except Exception as e:
        return ApiResponse(
            success=False,
            message="Failed to retrieve staff routes by route ID",
            error=str(e)
        ).to_response(400)