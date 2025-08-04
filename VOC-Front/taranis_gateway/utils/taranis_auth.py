import os
import requests
import logging

def get_taranis_token():
    """Récupère dynamiquement un token JWT depuis Taranis."""
    TARANIS_BASE_URL = os.getenv("TARANIS_BASE_URL", "https://192.168.40.55:4443")
    username = os.getenv("TARANIS_USERNAME", "admin")
    password = os.getenv("TARANIS_PASSWORD", "admin")

    try:
        response = requests.post(
            f"{TARANIS_BASE_URL}/api/v1/auth/login",
            json={"username": username, "password": password},
            verify=False,
            timeout=10
        )
        response.raise_for_status()
        return response.json().get("access_token")
    except Exception as e:
        logging.error(f"[Gateway] Échec récupération token Taranis : {e}")
        return None
