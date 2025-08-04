from flask import Blueprint, jsonify, request
import requests
import os
import urllib3
import uuid
automation_bp = Blueprint('automation', __name__)
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

# 🔍 GET Bots Nodes (filtré pour la liste principale)
@automation_bp.route('/bots-nodes', methods=['GET'])
def get_bots_nodes():
    headers = get_auth_headers()
    try:
        res = requests.get(f"{TARANIS_URL}/api/v1/config/bots-nodes", headers=headers, verify=False)
        full_data = res.json()

        simplified_items = [
            {
                "id": item.get("id"),
                "title": item.get("title"),
                "description": item.get("description"),
                "url": item.get("api_url"),
                "tag": item.get("tag")
            }
            for item in full_data.get("items", [])
        ]

        return jsonify({
            "total_count": full_data.get("total_count", 0),
            "items": simplified_items
        }), res.status_code

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🔍 GET Bots Nodes Details (full pour le formulaire d'ajout bot preset)
@automation_bp.route('/bots-nodes-full', methods=['GET'])
def get_bots_nodes_full():
    headers = get_auth_headers()
    try:
        res = requests.get(f"{TARANIS_URL}/api/v1/config/bots-nodes", headers=headers, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🔍 GET Bots Presets (liste simple)
@automation_bp.route('/bots-presets', methods=['GET'])
def get_bots_presets():
    headers = get_auth_headers()
    try:
        res = requests.get(f"{TARANIS_URL}/api/v1/config/bots-presets", headers=headers, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 🔍 GET Bots Preset by ID
@automation_bp.route('/bots-presets/<preset_id>', methods=['GET'])
def get_bot_preset_by_id(preset_id):
    headers = get_auth_headers()
    try:
        res = requests.get(f"{TARANIS_URL}/api/v1/config/bots-presets", headers=headers, verify=False)
        if res.status_code != 200:
            return jsonify({"error": f"Taranis response: {res.status_code}"}), res.status_code
        
        all_items = res.json().get("items", [])
        preset = next((item for item in all_items if item["id"] == preset_id), None)
        if preset:
            return jsonify(preset), 200
        else:
            return jsonify({"error": "Preset not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ➕ POST Bots Preset
@automation_bp.route('/bots-presets', methods=['POST'])
def create_bot_preset():
    headers = get_auth_headers()
    data = request.json
    data["id"] = str(uuid.uuid4())  # Ajout UUID manuellement

    try:
        res = requests.post(f"{TARANIS_URL}/api/v1/config/bots-presets", json=data, headers=headers, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": f"Erreur POST bots preset: {str(e)}"}), 500

# ✏️ PUT Bots Preset
@automation_bp.route('/bots-presets/<preset_id>', methods=['PUT'])
def update_bot_preset(preset_id):
    headers = get_auth_headers()
    data = request.json
    data["id"] = preset_id  # Assure-toi que l’ID est bien conservé

    try:
        res = requests.put(f"{TARANIS_URL}/api/v1/config/bots-presets/{preset_id}", json=data, headers=headers, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": f"Erreur PUT bots preset: {str(e)}"}), 500

# ❌ DELETE Bots Preset
@automation_bp.route('/bots-presets/<preset_id>', methods=['DELETE'])
def delete_bot_preset(preset_id):
    headers = get_auth_headers()
    try:
        res = requests.delete(f"{TARANIS_URL}/api/v1/config/bots-presets/{preset_id}", headers=headers, verify=False)
        return jsonify({"deleted": preset_id}), res.status_code
    except Exception as e:
        return jsonify({"error": f"Erreur DELETE bots preset: {str(e)}"}), 500
