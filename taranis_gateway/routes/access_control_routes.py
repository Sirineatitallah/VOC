from flask import Blueprint, jsonify, request
import requests
import os
import urllib3

# Disable SSL warnings
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# Init blueprint
access_control_bp = Blueprint('access_control', __name__)

# Env config
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


### USERS

@access_control_bp.route('/access-control/users', methods=['GET'])
def get_users():
    headers = get_auth_headers()
    try:
        res = requests.get(f"{TARANIS_URL}/api/v1/config/users", headers=headers, verify=False)
        data = res.json()

        simplified_items = [
            {
                "id": user.get("id"),
                "username": user.get("username"),
                "name": user.get("name"),
                "roles": [role.get("name") for role in user.get("roles", [])],
                "organizations": [org.get("name") for org in user.get("organizations", [])],
                "tag": user.get("tag")
            }
            for user in data.get("items", [])
        ]

        return jsonify({
            "total_count": data.get("total_count", 0),
            "items": simplified_items
        }), res.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@access_control_bp.route('/access-control/users/<int:user_id>', methods=['GET'])
def get_user_by_id(user_id):
    headers = get_auth_headers()
    try:
        # Récupérer tous les users
        res = requests.get(f"{TARANIS_URL}/api/v1/config/users", headers=headers, verify=False)
        data = res.json()
        users = data.get("items", [])

        # Chercher le user avec l'id correspondant
        user = next((u for u in users if u.get("id") == user_id), None)

        if not user:
            return jsonify({"error": "User not found"}), 404

        # Retourner l'utilisateur complet sans filtrage
        return jsonify(user), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@access_control_bp.route('/access-control/users', methods=['POST'])
def create_user():
    headers = get_auth_headers()
    try:
        payload = request.json
        res = requests.post(f"{TARANIS_URL}/api/v1/config/users", headers=headers, json=payload, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@access_control_bp.route('/access-control/users/<int:user_id>', methods=['PUT'])
def update_user(user_id):
    headers = get_auth_headers()
    try:
        payload = request.json
        res = requests.put(f"{TARANIS_URL}/api/v1/config/users/{user_id}", headers=headers, json=payload, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@access_control_bp.route('/access-control/users/<int:user_id>', methods=['DELETE'])
def delete_user(user_id):
    headers = get_auth_headers()
    try:
        res = requests.delete(f"{TARANIS_URL}/api/v1/config/users/{user_id}", headers=headers, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500


### ORGANIZATIONS

@access_control_bp.route('/access-control/organizations', methods=['GET'])
def get_organizations():
    headers = get_auth_headers()
    try:
        res = requests.get(f"{TARANIS_URL}/api/v1/config/organizations", headers=headers, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

### ROLES

@access_control_bp.route('/access-control/roles', methods=['GET'])
def get_roles():
    headers = get_auth_headers()
    try:
        res = requests.get(f"{TARANIS_URL}/api/v1/config/roles", headers=headers, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

### ACLS

@access_control_bp.route('/access-control/acls', methods=['GET'])
def get_acls():
    headers = get_auth_headers()
    try:
        res = requests.get(f"{TARANIS_URL}/api/v1/config/acls", headers=headers, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500
