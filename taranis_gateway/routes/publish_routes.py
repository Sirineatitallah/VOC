from flask import Blueprint, jsonify, request
import requests
import os
import urllib3

publishers_bp = Blueprint('publishers', __name__)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

TARANIS_URL = os.getenv("TARANIS_BASE_URL", "https://192.168.100.44:4443")
TARANIS_USERNAME = "admin"
TARANIS_PASSWORD = "admin"

# 🔐 Récupérer le token JWT depuis TaranisNG
def get_api_token():
    login_url = f"{TARANIS_URL}/api/v1/auth/login"
    payload = {
        "username": TARANIS_USERNAME,
        "password": TARANIS_PASSWORD
    }
    try:
        response = requests.post(login_url, json=payload, verify=False)
        response.raise_for_status()
        return response.json().get("access_token")
    except Exception as e:
        print(f"❌ Erreur login: {e}")
        return None

# 📎 Ajouter l'Authorization Header
def get_auth_headers():
    token = get_api_token()
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

# 🔍 GET /publishers-nodes
@publishers_bp.route('/publishers-nodes', methods=['GET'])
def get_publishers_nodes():
    headers = get_auth_headers()
    try:
        res = requests.get(f"{TARANIS_URL}/api/v1/config/publishers-nodes", headers=headers, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": f"Erreur get publishers-nodes : {str(e)}"}), 500

# 🔍 GET all Publisher Presets
@publishers_bp.route('/publishers-presets', methods=['GET'])
def get_publishers_presets():
    headers = get_auth_headers()
    try:
        res = requests.get(f"{TARANIS_URL}/api/v1/config/publishers-presets", headers=headers, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": f"Erreur get publishers-presets : {str(e)}"}), 500

# 🔍 GET Publisher Preset by ID (filtrage côté backend)
@publishers_bp.route('/publishers-presets/<preset_id>', methods=['GET'])
def get_publisher_preset_by_id(preset_id):
    headers = get_auth_headers()
    try:
        res = requests.get(f"{TARANIS_URL}/api/v1/config/publishers-presets", headers=headers, verify=False)
        if res.status_code != 200:
            return jsonify({"error": "Impossible de récupérer les presets"}), res.status_code

        presets = res.json()
        preset = next((p for p in presets if p.get("id") == preset_id), None)
        if preset is None:
            return jsonify({"error": "Preset introuvable"}), 404
        return jsonify(preset), 200
    except Exception as e:
        return jsonify({"error": f"Erreur get by id: {str(e)}"}), 500

# ➕ POST Publisher Preset
@publishers_bp.route('/publishers-presets', methods=['POST'])
def create_publisher_preset():
    headers = get_auth_headers()
    data = request.json
    try:
        res = requests.post(f"{TARANIS_URL}/api/v1/config/publishers-presets", headers=headers, json=data, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": f"Erreur création preset : {str(e)}"}), 500

# ✏️ PUT Publisher Preset
@publishers_bp.route('/publishers-presets/<preset_id>', methods=['PUT'])
def update_publisher_preset(preset_id):
    headers = get_auth_headers()
    data = request.json
    try:
        res = requests.put(f"{TARANIS_URL}/api/v1/config/publishers-presets/{preset_id}", headers=headers, json=data, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": f"Erreur modification preset : {str(e)}"}), 500

# ❌ DELETE Publisher Preset
@publishers_bp.route('/publishers-presets/<preset_id>', methods=['DELETE'])
def delete_publisher_preset(preset_id):
    headers = get_auth_headers()
    try:
        res = requests.delete(f"{TARANIS_URL}/api/v1/config/publishers-presets/{preset_id}", headers=headers, verify=False)
        return jsonify({"message": "Preset supprimé"}), res.status_code
    except Exception as e:
        return jsonify({"error": f"Erreur suppression preset : {str(e)}"}), 500
