import jwt
import redis
import requests
from fastapi import FastAPI, HTTPException, status, Header, Depends
from typing import Dict, Any, Optional
from pydantic import BaseModel

app = FastAPI()

# Initialize Redis
redis_client = redis.Redis(host="localhost", port=6379, decode_responses=True)
AUTH_SERVICE_URL = "http://localhost:5000/auth/public-key"

class ErrorResponse(BaseModel):
    error: str
    description: str
    debug_info: Optional[str] = None

# Error Templates
ERRORS = {
    "MISSING_TOKEN": ErrorResponse(
        error="missing_token",
        description="Authorization header missing or invalid"
    ),
    "UNSUPPORTED_ALG": ErrorResponse(
        error="unsupported_algorithm",
        description="Only RS256 algorithm is supported",
        debug_info="Check your token generation configuration"
    ),
    "INVALID_TOKEN": ErrorResponse(
        error="invalid_token",
        description="Token verification failed"
    ),
    "EXPIRED_TOKEN": ErrorResponse(
        error="expired_token",
        description="Token has expired"
    ),
    "KEY_ERROR": ErrorResponse(
        error="key_error",
        description="Public key retrieval failed"
    )
}

def get_public_key() -> str:
    """Retrieve and cache public key with robust error handling"""
    try:
        # Check cache first
        if cached_key := redis_client.get("jwt_public_key"):
            return cached_key

        # Fetch fresh key
        response = requests.get(AUTH_SERVICE_URL, timeout=3)
        response.raise_for_status()
        key_data = response.json()
        
        pem_key = key_data["publicKey"]
        
        # Validate key format
        if not pem_key.startswith("-----BEGIN PUBLIC KEY-----"):
            raise ValueError("Invalid key format")

        # Cache key for 1 hour
        redis_client.setex("jwt_public_key", 3600, pem_key)
        return pem_key

    except Exception as e:
        print(f"Key retrieval error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=ERRORS["KEY_ERROR"].dict()
        )

def verify_jwt(token: str):
    try:
        # First validate token structure
        parts = token.split('.')
        if len(parts) != 3:
            raise HTTPException(status_code=401, detail="Invalid token structure")

        # Get valid public key
        public_key = get_public_key()
        print("token: ", token)
        print("public_key: ", public_key)
        # Decode with strict validation
        payload = jwt.decode(
            token,
            public_key,
            algorithms=["RS256"],  # Only allow RS256
            options={
                "verify_exp": True,
                "verify_iat": True,
                "verify_nbf": True,
                "require": ["exp", "iat", "nbf", "unique_name", "role"]
            }
        )
        
        # Additional business logic validation
        if payload.get("role") not in ["admin", "user"]:
            raise HTTPException(status_code=403, detail="Invalid role")
            
        return payload

    except jwt.InvalidAlgorithmError:
        raise HTTPException(
            status_code=401, 
            detail="Invalid algorithm. Only RS256 supported"
        )
    except Exception as e:
        raise HTTPException(
            status_code=401,
            detail=f"Token verification failed: {str(e)}"
        )
async def get_bearer_token(authorization: str = Header(...)) -> str:
    """Extract token from Authorization header"""
    if not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=ERRORS["MISSING_TOKEN"].dict()
        )
    return authorization[7:]  # Remove "Bearer " prefix

