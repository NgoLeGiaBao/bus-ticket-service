# from fastapi import FastAPI, Depends, HTTPException, Security
# from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
# import jwt

# app = FastAPI()
# security = HTTPBearer()

# # 🔑 Cấu hình JWT giống ASP.NET Core
# SECRET_KEY = "m4uZQ!xvC@8yB#zQ@5L9&WfK$MnP3tG#"
# ALGORITHM = "HS256"
# ISSUER = "bus-ticket-auth-service"
# AUDIENCE = "bus-ticket-users"

# # ✅ Hàm xác thực token
# def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
#     token = credentials.credentials
#     try:
#         payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], issuer=ISSUER, audience=AUDIENCE)
#         if "sub" not in payload:
#             raise HTTPException(status_code=401, detail="Invalid token: Missing subject")
#         return payload
#     except jwt.ExpiredSignatureError:
#         raise HTTPException(status_code=401, detail="Token expired")
#     except jwt.InvalidTokenError:
#         raise HTTPException(status_code=401, detail="Invalid token")

# # ✅ API mở
# @app.get("/")
# def public_api():
#     return {"message": "Hello! This is a public API."}

# # ✅ API yêu cầu JWT
# @app.get("/secure-data")
# def secure_api(user_data: dict = Depends(verify_token)):
#     return {"message": "This is a protected API", "user": user_data}


# from fastapi import FastAPI, HTTPException
# from pydantic import BaseModel
# from typing import Literal
# import httpx
# import os
# from dotenv import load_dotenv
# from models import StaffRoute, DispatchAssignment

# load_dotenv()

# SUPABASE_URL = os.getenv("SUPABASE_URL")
# SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# HEADERS = {
#     "apikey": SUPABASE_KEY,
#     "Authorization": f"Bearer {SUPABASE_KEY}",
#     "Content-Type": "application/json",
# }

# app = FastAPI()

# from fastapi import FastAPI, HTTPException
# from dotenv import load_dotenv
# from models import StaffRoute, DispatchAssignment
# import os, httpx

# load_dotenv()

# SUPABASE_URL = os.getenv("SUPABASE_URL")
# SUPABASE_KEY = os.getenv("SUPABASE_KEY")

# HEADERS = {
#     "apikey": SUPABASE_KEY,
#     "Authorization": f"Bearer {SUPABASE_KEY}",
#     "Content-Type": "application/json",
# }

# app = FastAPI()

# # ========== STAFF ROUTES ==========
# @app.get("/staff-routes")
# async def list_staff_routes():
#     async with httpx.AsyncClient() as client:
#         r = await client.get(f"{SUPABASE_URL}/rest/v1/staff_routes", headers=HEADERS)
#         return r.json()

# @app.post("/staff-routes")
# async def create_staff_route(route: StaffRoute):
#     async with httpx.AsyncClient() as client:
#         r = await client.post(
#             f"{SUPABASE_URL}/rest/v1/staff_routes",
#             headers=HEADERS,
#             json=route.dict()
#         )
#         if r.status_code != 201:
#             raise HTTPException(r.status_code, detail=r.text)
#         return r.json()

# @app.delete("/staff-routes/")
# async def delete_staff_route(staff_id: str, route_id: str, direction: str):
#     async with httpx.AsyncClient() as client:
#         r = await client.delete(
#             f"{SUPABASE_URL}/rest/v1/staff_routes?staff_id=eq.{staff_id}&route_id=eq.{route_id}&direction=eq.{direction}",
#             headers=HEADERS,
#         )
#         if r.status_code != 204:
#             raise HTTPException(r.status_code, detail=r.text)
#         return {"message": "Deleted successfully"}

# # ========== DISPATCH ASSIGNMENTS ==========
# @app.get("/dispatch-assignments")
# async def list_dispatch_assignments():
#     async with httpx.AsyncClient() as client:
#         r = await client.get(f"{SUPABASE_URL}/rest/v1/dispatch_assignments", headers=HEADERS)
#         return r.json()

# @app.get("/dispatch-assignments/by-staff/{staff_id}")
# async def get_assignments_by_staff(staff_id: str):
#     async with httpx.AsyncClient() as client:
#         r = await client.get(
#             f"{SUPABASE_URL}/rest/v1/dispatch_assignments?staff_id=eq.{staff_id}",
#             headers=HEADERS
#         )
#         return r.json()

# @app.post("/dispatch-assignments")
# async def create_dispatch_assignment(assignment: DispatchAssignment):
#     # Kiểm tra staff có được phép chạy route đó không
#     async with httpx.AsyncClient() as client:
#         check_url = f"{SUPABASE_URL}/rest/v1/staff_routes?staff_id=eq.{assignment.staff_id}&route_id=eq.{assignment.route_id}"
#         route_check = await client.get(check_url, headers=HEADERS)

#         if not route_check.json():
#             raise HTTPException(400, "Tài xế chưa được phân tuyến phù hợp")

#         # Nếu hợp lệ thì mới insert vào bảng dispatch
#         r = await client.post(
#             f"{SUPABASE_URL}/rest/v1/dispatch_assignments",
#             headers=HEADERS,
#             json=assignment.dict()
#         )
#         if r.status_code != 201:
#             raise HTTPException(r.status_code, detail=r.text)
#         return r.json()


from fastapi import FastAPI
from api.dispatch_routes import router as dispatch_router

from fastapi import FastAPI, Depends, HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt

app = FastAPI()
security = HTTPBearer()

# 🔑 Cấu hình JWT giống ASP.NET Core
SECRET_KEY = "m4uZQ!xvC@8yB#zQ@5L9&WfK$MnP3tG#"
ALGORITHM = "HS256"
ISSUER = "bus-ticket-auth-service"
AUDIENCE = "bus-ticket-users"

# ✅ Hàm xác thực token
def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)):
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM], issuer=ISSUER, audience=AUDIENCE)
        if "sub" not in payload:
            raise HTTPException(status_code=401, detail="Invalid token: Missing subject")
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ✅ API mở
@app.get("/")
def public_api():
    return {"message": "Hello! This is a public API."}

# ✅ API yêu cầu JWT
@app.get("/secure-data")
def secure_api(user_data: dict = Depends(verify_token)):
    return {"message": "This is a protected API", "user": user_data}

# app = FastAPI()
app.include_router(dispatch_router, prefix="/dispatch-assignments")