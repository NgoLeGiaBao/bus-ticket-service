from fastapi import APIRouter, HTTPException
from services.dispatch_service import (
    add_staff_route,
    get_staff_routes,
    update_staff_route,
    delete_staff_route,
    get_all_staff_routes,
    add_dispatch_assignment,
    get_dispatch_history,
    get_latest_dispatch,
    delete_dispatch,
    add_unavailability,
    get_unavailability
)
from models.dispatch_schema import StaffRouteCreate, StaffRouteUpdate, DispatchAssignmentCreate, StaffUnavailabilityCreate
from response.ApiResponse import ApiResponse

router = APIRouter()

@router.post("/staff_routes")
def create_staff_route(data: StaffRouteCreate):
    try:
        response_data = add_staff_route(data)  # Call service function
        if response_data:
            api_response = ApiResponse(
                success=True,
                message="Staff route created successfully",
                data=response_data
            )
        else:
            api_response = ApiResponse(
                success=False,
                message="Failed to create staff route",
                error="No data returned"
            )
        return api_response
    except Exception as e:
        api_response = ApiResponse(
            success=False,
            message="An error occurred",
            error=str(e)
        )
        return api_response


@router.get("/staff_routes/{staff_id}")
def get_routes_for_staff(staff_id: str):
    try:
        routes = get_staff_routes(staff_id) 
        if not routes:
            api_response = ApiResponse(success=False, message="No routes found for this staff member", error="Not Found")
        else:
            api_response = ApiResponse(success=True, message="Staff routes retrieved successfully", data=routes)
        return api_response
    except Exception as e:
        api_response = ApiResponse(success=False, message="An error occurred", error=str(e))
        return api_response


@router.put("/staff_routes/{staff_id}/{route_id}")
def update_route_for_staff(staff_id: str, route_id: str, data: StaffRouteUpdate):
    try:
        updated_route = update_staff_route(staff_id, route_id, data) 
        if not updated_route:
            api_response = ApiResponse(success=False, message="Route not found for this staff member", error="Not Found")
        else:
            api_response = ApiResponse(success=True, message="Staff route updated successfully", data=updated_route)
        return api_response
    except Exception as e:
        api_response = ApiResponse(success=False, message="An error occurred", error=str(e))
        return api_response


@router.delete("/staff_routes/{staff_id}/{route_id}")
def delete_route_for_staff(staff_id: str, route_id: str):
    try:
        deleted_route = delete_staff_route(staff_id, route_id) 
        if not deleted_route:
            api_response = ApiResponse(success=False, message="Route not found for this staff member", error="Not Found")
        else:
            api_response = ApiResponse(success=True, message="Staff route deleted successfully", data=deleted_route)
        return api_response
    except Exception as e:
        api_response = ApiResponse(success=False, message="An error occurred", error=str(e))
        return api_response


@router.get("/staff_routes")
def get_all_routes():
    try:
        all_routes = get_all_staff_routes() 
        if not all_routes:
            api_response = ApiResponse(success=False, message="No staff routes found", error="Not Found")
        else:
            api_response = ApiResponse(success=True, message="All staff routes retrieved successfully", data=all_routes)
        return api_response
    except Exception as e:
        api_response = ApiResponse(success=False, message="An error occurred", error=str(e))
        return api_response


@router.post("/dispatch")
def create_dispatch(data: DispatchAssignmentCreate):
    try:
        return add_dispatch_assignment(data) 
    except Exception as e:
        api_response = ApiResponse(success=False, message="An error occurred", error=str(e))
        return api_response


@router.get("/dispatch")
def list_dispatch():
    try:
        return get_dispatch_history() 
    except Exception as e:
        api_response = ApiResponse(success=False, message="An error occurred", error=str(e))
        return api_response


@router.get("/dispatch/{staff_id}")
def get_dispatch_by_staff(staff_id: str):
    try:
        return get_dispatch_history(staff_id) 
    except Exception as e:
        api_response = ApiResponse(success=False, message="An error occurred", error=str(e))
        return api_response


@router.get("/dispatch/{staff_id}/latest")
def get_latest_dispatch_by_staff(staff_id: str):
    try:
        return get_latest_dispatch(staff_id) 
    except Exception as e:
        api_response = ApiResponse(success=False, message="An error occurred", error=str(e))
        return api_response


@router.delete("/dispatch/{assignment_id}")
def delete_dispatch_assignment(assignment_id: str):
    try:
        return delete_dispatch(assignment_id) 
    except Exception as e:
        api_response = ApiResponse(success=False, message="An error occurred", error=str(e))
        return api_response


@router.post("/unavailability")
def create_unavailability(data: StaffUnavailabilityCreate):
    try:
        return add_unavailability(data)  # Removed await
    except Exception as e:
        api_response = ApiResponse(success=False, message="An error occurred", error=str(e))
        return api_response


@router.get("/unavailability/{staff_id}")
def get_unavailability_by_staff(staff_id: str):
    try:
        return get_unavailability(staff_id) 
    except Exception as e:
        api_response = ApiResponse(success=False, message="An error occurred", error=str(e))
        return api_response
