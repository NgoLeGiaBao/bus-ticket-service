from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from typing import Dict
from dotenv import load_dotenv
import os

# Load environment variables from .env file
load_dotenv()

# Get environment variables
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM")
ISSUER = os.getenv("ISSUER")
AUDIENCE = os.getenv("AUDIENCE")

# Check if required environment variables are missing
if not SECRET_KEY or not ALGORITHM or not ISSUER or not AUDIENCE:
    raise ValueError("Missing required environment variables. Please check your .env file.")

# Security configuration for HTTPBearer authentication
security = HTTPBearer()

def verify_token(credentials: HTTPAuthorizationCredentials = Security(security)) -> Dict:
    """
    Verify and decode JWT token
    Returns the token payload if valid, or raises HTTPException if invalid
    """
    token = credentials.credentials
    try:
        # Decode JWT
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            issuer=ISSUER,
            audience=AUDIENCE
        )
        print("Decoded Token Payload:", payload)  # Debug output

        # Check if the required subject is in the payload
        if "sub" not in payload:
            raise HTTPException(status_code=401, detail="Invalid token: Missing subject")
        
        return payload  # Return decoded payload
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except jwt.InvalidTokenError as e:
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")

def check_role(required_role: str):
    """
    Dependency factory to check user role
    Usage: Depends(check_role("admin"))
    """
    def role_checker(user_data: dict = Depends(verify_token)):
        # Validate user_data type
        if not isinstance(user_data, dict):
            raise HTTPException(
                status_code=500,
                detail="User data is not in expected format"
            )

        # Ensure 'role' exists and is not empty
        if "role" not in user_data or not user_data["role"]:
            raise HTTPException(
                status_code=403,
                detail="User role not specified or empty in token"
            )

        # Check if role matches required role
        if user_data["role"].lower() != required_role.lower():
            raise HTTPException(
                status_code=403,
                detail=f"Requires {required_role} role to access this resource"
            )
        
        return user_data  # Return user data if role matches
    
    return role_checker
