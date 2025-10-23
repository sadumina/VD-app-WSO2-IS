import os
import requests
from requests.auth import HTTPBasicAuth
from fastapi import HTTPException
from dotenv import load_dotenv
import urllib3

# 🚫 Disable SSL warnings for self-signed WSO2 certs (only for localhost dev)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

load_dotenv()

# ---------------------------------------------------------------------
# 🔐 WSO2 Configuration
# ---------------------------------------------------------------------
CLIENT_ID = os.getenv("WSO2_CLIENT_ID", "XmlbpXheBrnG8BcrsEO9bEJGzXIa")
CLIENT_SECRET = os.getenv("WSO2_CLIENT_SECRET", "_cADO07sjDZUR0YRogXhU9lYyST_XUN7FrOd5i2uriwa")
TOKEN_URL = os.getenv("WSO2_TOKEN_URL", "https://localhost:9443/oauth2/token")
USERINFO_URL = os.getenv("WSO2_USERINFO_URL", "https://localhost:9443/oauth2/userinfo")

# ---------------------------------------------------------------------
# 🧠 Track used authorization codes to prevent reuse errors
# ---------------------------------------------------------------------
used_codes = set()

# ---------------------------------------------------------------------
# 🧩 Exchange authorization code for tokens
# ---------------------------------------------------------------------
def exchange_code_for_token(code: str, redirect_uri: str):
    """
    Exchange the authorization code for access and ID tokens.
    Ensures each authorization code is used only once (WSO2 rule).
    """

    global used_codes

    # ✅ Prevent code reuse (WSO2 will reject reused codes)
    if code in used_codes:
        raise HTTPException(status_code=400, detail="Authorization code already used")

    data = {
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": redirect_uri,
    }

    headers = {"Content-Type": "application/x-www-form-urlencoded"}

    print("\n🔁 --- Sending Token Request to WSO2 ---")
    print("📡 Endpoint:", TOKEN_URL)
    print("📦 Form Data:", data)
    print("🔑 Using CLIENT_ID:", CLIENT_ID)
    print("----------------------------------------")

    try:
        response = requests.post(
            TOKEN_URL,
            data=data,
            headers=headers,
            auth=HTTPBasicAuth(CLIENT_ID, CLIENT_SECRET),
            verify=False,  # ✅ Ignore SSL warnings for localhost
            timeout=15,
        )

        print("📥 WSO2 Response Status:", response.status_code)
        print("📄 WSO2 Response Body:", response.text)
        print("----------------------------------------\n")

        # ✅ If successful
        if response.status_code == 200:
            used_codes.add(code)  # mark code as used
            print("✅ Token exchange successful\n")
            return response.json()

        # ❌ Handle bad responses gracefully
        raise HTTPException(
            status_code=response.status_code,
            detail=f"Token exchange failed: {response.text}",
        )

    except requests.exceptions.RequestException as e:
        print("❌ Network error during token request:", str(e))
        raise HTTPException(status_code=500, detail="WSO2 server unreachable")

    except Exception as e:
        print("❌ Exception during token request:", str(e))
        raise HTTPException(status_code=400, detail=f"Token request error: {str(e)}")

# ---------------------------------------------------------------------
# 👤 Fetch user info using access token
# ---------------------------------------------------------------------
def get_userinfo(access_token: str):
    """
    Retrieve user profile info from WSO2 /userinfo endpoint.
    """
    headers = {"Authorization": f"Bearer {access_token}"}

    print("🔍 Fetching user info from:", USERINFO_URL)

    response = requests.get(USERINFO_URL, headers=headers, verify=False)

    print("📥 User Info Status:", response.status_code)
    print("📄 User Info Response:", response.text)

    if response.status_code != 200:
        print("❌ Failed to fetch user info:", response.status_code, response.text)
        raise HTTPException(status_code=response.status_code, detail=response.text)

    print("✅ User info fetched successfully\n")
    return response.json()
