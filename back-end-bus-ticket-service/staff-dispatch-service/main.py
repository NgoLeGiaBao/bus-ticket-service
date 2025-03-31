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
