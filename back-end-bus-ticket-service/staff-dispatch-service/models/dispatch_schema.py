from pydantic import BaseModel
from datetime import datetime
from uuid import UUID

class StaffRouteCreate(BaseModel):
    staff_id: UUID
    route_id: UUID
    full_name: str
    role: str  

class StaffRouteUpdate(BaseModel):
    staff_id: UUID
    route_id: UUID
    full_name: str
    role: str 

class DispatchAssignmentCreate(BaseModel):
    staff_id: UUID
    trip_id: UUID
    route_id: UUID
    assigned_at: datetime
    expected_end_time: datetime
    from_location: str
    to_location: str

class StaffUnavailabilityCreate(BaseModel):
    staff_id: UUID
    start_time: datetime
    end_time: datetime
