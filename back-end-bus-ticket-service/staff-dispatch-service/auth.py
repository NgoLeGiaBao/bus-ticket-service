# # auth.py
# import jwt
# import requests
# from fastapi import HTTPException
# from pydantic import BaseModel
# from typing import Optional
# import json

# class TokenData(BaseModel):
#     unique_name: str
#     role: str
#     jti: Optional[str]
#     iat: Optional[int]
#     nbf: Optional[int]
#     exp: Optional[int]

# # Configuration
# C_SHARP_SERVICE_URL = "http://localhost:5000"
# PUBLIC_KEY_URL = f"{C_SHARP_SERVICE_URL}/auth/public-key"
# HEALTH_CHECK_URL = f"{C_SHARP_SERVICE_URL}/auth/health"

# def check_service_connection() -> bool:
#     """Verify connection to C# service"""
#     try:
#         response = requests.get(HEALTH_CHECK_URL, timeout=2)
#         return response.status_code == 200
#     except:
#         return False

# def get_public_key() -> str:
#     """Retrieve public key from C# service with robust error handling"""
#     if not check_service_connection():
#         raise HTTPException(
#             status_code=503,
#             detail="Cannot connect to authentication service"
#         )

#     try:
#         response = requests.get(
#             PUBLIC_KEY_URL,
#             headers={'Accept': 'text/plain'},
#             timeout=5
#         )
#         response.raise_for_status()
        
#         public_key = response.text.strip()
        
#         # Validate PEM format
#         if not public_key.startswith("-----BEGIN PUBLIC KEY-----"):
#             raise ValueError("Invalid PEM format - missing header")
#         if not public_key.endswith("-----END PUBLIC KEY-----"):
#             raise ValueError("Invalid PEM format - missing footer")
            
#         return public_key
        
#     except requests.exceptions.RequestException as e:
#         raise HTTPException(
#             status_code=502,
#             detail=f"Failed to retrieve public key: {str(e)}"
#         )
#     except ValueError as e:
#         raise HTTPException(
#             status_code=502,
#             detail=f"Invalid public key format: {str(e)}"
#         )

# def verify_jwt(token: str) -> TokenData:
#     """Verify JWT token with comprehensive validation"""
#     try:
#         # Step 1: Get and validate public key
#         public_key = get_public_key()
        
#         # Step 2: Decode header first to check algorithm
#         try:
#             header = jwt.get_unverified_header(token)
#             if header.get("alg") != "RS256":
#                 raise HTTPException(
#                     status_code=401,
#                     detail="Invalid token algorithm. Only RS256 supported"
#                 )
#         except Exception as e:
#             raise HTTPException(
#                 status_code=401,
#                 detail=f"Invalid token header: {str(e)}"
#             )
        
#         # Step 3: Full token verification
#         payload = jwt.decode(
#             token,
#             public_key,
#             algorithms=["RS256"],
#             options={
#                 "verify_exp": True,
#                 "verify_aud": False,
#                 "verify_iss": False,
#                 "require": ["exp", "iat", "nbf", "unique_name", "role"]
#             }
#         )
        
#         # Step 4: Additional business validation
#         if payload.get("role") not in ["admin", "user"]:
#             raise HTTPException(
#                 status_code=403,
#                 detail="Insufficient privileges"
#             )
            
#         return TokenData(**payload)
        
#     except jwt.ExpiredSignatureError:
#         raise HTTPException(
#             status_code=401,
#             detail="Token has expired"
#         )
#     except jwt.InvalidTokenError as e:
#         raise HTTPException(
#             status_code=401,
#             detail=f"Invalid token: {str(e)}"
#         )
#     except HTTPException:
#         raise  # Re-raise our own HTTP exceptions
#     except Exception as e:
#         raise HTTPException(
#             status_code=500,
#             detail=f"Token verification failed: {str(e)}"
#         )