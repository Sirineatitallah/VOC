from flask import Blueprint, jsonify, request
import requests
import os
import urllib3

remote_bp = Blueprint('remote', __name__)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

TARANIS_URL = os.getenv("TARANIS_BASE_URL", "https://192.168.100.44:4443")
TARANIS_USERNAME = "admin"
TARANIS_PASSWORD = "admin"

def get_api_token():
    login_url = f"{TARANIS_URL}/api/v1/auth/login"
    payload = {"username": TARANIS_USERNAME, "password": TARANIS_PASSWORD}
    try:
        response = requests.post(login_url, json=payload, verify=False)
        response.raise_for_status()
        return response.json().get("access_token")
    except Exception as e:
        print(f"❌ Erreur login : {e}")
        return None

def get_auth_headers():
    token = get_api_token()
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

# GET remote-nodes
@remote_bp.route('/remote-nodes', methods=['GET'])
def get_remote_nodes():
    headers = get_auth_headers()
    try:
        res = requests.get(f"{TARANIS_URL}/api/v1/config/remote-nodes", headers=headers, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# GET remote-accesses
@remote_bp.route('/remote-accesses', methods=['GET'])
def get_remote_accesses():
    headers = get_auth_headers()
    try:
        res = requests.get(f"{TARANIS_URL}/api/v1/config/remote-accesses", headers=headers, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500
