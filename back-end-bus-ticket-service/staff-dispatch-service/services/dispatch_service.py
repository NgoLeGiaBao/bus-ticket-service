from fastapi import HTTPException
from datetime import datetime
from core.supabase_client import supabase
from uuid import UUID
from models.dispatch_schema import StaffRouteCreate, StaffRouteUpdate, DispatchAssignmentCreate, StaffUnavailabilityCreate
from typing import Optional

# Helper function to serialize UUID
def serialize_uuid(obj):
    if isinstance(obj, UUID):
        return str(obj)
    if isinstance(obj, datetime):
        return obj.isoformat()
    return obj

# Staff Routes APIs
def add_staff_route(data: StaffRouteCreate):
    try:
       
        data_dict = data.dict()
        serialized_data = {key: serialize_uuid(value) for key, value in data_dict.items()}

        response = supabase.table("staff_routes").insert(serialized_data).execute()
     
        if response.data: 
            staff_route_data = response.data[0] 
            return staff_route_data
        else:
            return {"error": "Failed to add staff route", "status_code": "Unknown"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


def get_staff_routes(staff_id: str):
    try:
        response = supabase.table("staff_routes").select("*").eq("staff_id", staff_id).execute()
        if response.data:
            return [{key: serialize_uuid(value) for key, value in route.items()} for route in response.data]
        else:
            return {"error": "Failed to fetch staff routes", "status_code": "Unknown"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def update_staff_route(staff_id: str, route_id: str, data: StaffRouteUpdate):
    try:
        serialized_data = {key: serialize_uuid(value) for key, value in data.dict().items()}
        response = supabase.table("staff_routes").update(serialized_data).eq("staff_id", staff_id).eq("route_id", route_id).execute()
        
        if response.data:
            return {key: serialize_uuid(value) for key, value in response.data[0].items()}
        else:
            return {"error": "Failed to update staff route", "status_code": "Unknown"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def delete_staff_route(staff_id: str, route_id: str):
    try:
        response = supabase.table("staff_routes").delete().eq("staff_id", staff_id).eq("route_id", route_id).execute()
        if response.data:
            return {"message": "Staff route deleted successfully"}
        else:
            return {"error": "Failed to delete staff route", "status_code": "Unknown"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_all_staff_routes():
    try:
        response = supabase.table("staff_routes").select("*").execute()
        if response.data:
            return [{key: serialize_uuid(value) for key, value in route.items()} for route in response.data]
        else:
            return {"error": "Failed to fetch all staff routes", "status_code": "Unknown"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Dispatch Assignments APIs
def add_dispatch_assignment(data: DispatchAssignmentCreate):
    try:
        if data.expected_end_time <= data.assigned_at:
            raise HTTPException(status_code=400, detail="expected_end_time must be after assigned_at")

        existing_dispatch = supabase.table("dispatch_assignments") \
            .select("*") \
            .eq("staff_id", str(data.staff_id)) \
            .execute()

        for dispatch in existing_dispatch.data:
            start = datetime.fromisoformat(dispatch["assigned_at"])
            end = datetime.fromisoformat(dispatch["expected_end_time"])
            if (data.assigned_at < end and data.expected_end_time > start):
                raise HTTPException(status_code=400, detail="Driver has another assignment during this time")

        off_periods = supabase.table("staff_unavailability") \
            .select("*") \
            .eq("staff_id", str(data.staff_id)) \
            .execute()

        for off in off_periods.data:
            off_start = datetime.fromisoformat(off["start_time"])
            off_end = datetime.fromisoformat(off["end_time"])
            if (data.assigned_at < off_end and data.expected_end_time > off_start):
                raise HTTPException(status_code=400, detail="Driver is unavailable during this time")

        # Serialize UUID và datetime
        serialized_data = {k: serialize_uuid(v) for k, v in data.dict().items()}

        return supabase.table("dispatch_assignments").insert(serialized_data).execute()

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_dispatch_history(staff_id: Optional[str] = None):
    try:
        query = supabase.table("dispatch_assignments").select("*")
        
        if staff_id:
            query = query.eq("staff_id", staff_id)

        response = query.execute()
        
        if response.data:
            return [{key: serialize_uuid(value) for key, value in dispatch.items()} for dispatch in response.data]
        else:
            return {"error": "No dispatch records found", "status_code": "Not Found"}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_latest_dispatch(staff_id: str):
    try:
        response = supabase.table("dispatch_assignments") \
            .select("*") \
            .eq("staff_id", staff_id) \
            .order("assigned_at", desc=True) \
            .limit(1) \
            .execute()

        if response.data:
            return [{key: serialize_uuid(value) for key, value in dispatch.items()} for dispatch in response.data]
        else:
            return {"error": "Failed to fetch latest dispatch", "status_code": "Unknown"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def delete_dispatch(assignment_id: str):
    try:
        response = supabase.table("dispatch_assignments").delete().eq("id", assignment_id).execute()
        if response.data:
            return {"message": "Dispatch deleted successfully"}
        else:
            return {"error": "Failed to delete dispatch", "status_code": "Unknown"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Staff Unavailability APIs
def add_unavailability(data: StaffUnavailabilityCreate):
    try:
        if data.end_time <= data.start_time:
            raise HTTPException(status_code=400, detail="end_time must be after start_time")

        dispatches = supabase.table("dispatch_assignments") \
            .select("*") \
            .eq("staff_id", str(data.staff_id)) \
            .execute()

        for d in dispatches.data:
            start = datetime.fromisoformat(d["assigned_at"])
            end = datetime.fromisoformat(d["expected_end_time"])
            if (data.start_time < end and data.end_time > start):
                raise HTTPException(status_code=400, detail="Cannot mark as unavailable due to existing dispatch during this time")

        return supabase.table("staff_unavailability").insert(data.dict()).execute()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

def get_unavailability(staff_id: str):
    try:
        response = supabase.table("staff_unavailability").select("*").eq("staff_id", staff_id).execute()
        if response.data:
            return [{key: serialize_uuid(value) for key, value in unavailability.items()} for unavailability in response.data]
        else:
            return {"error": "Failed to fetch unavailability", "status_code": "Unknown"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
