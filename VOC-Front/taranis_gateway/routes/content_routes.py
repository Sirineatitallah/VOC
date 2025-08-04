from flask import Blueprint, jsonify, request
import requests
import os
import urllib3

content_bp = Blueprint('content', __name__)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# 🌐 Configuration TaranisNG
TARANIS_URL = os.getenv("TARANIS_BASE_URL", "https://192.168.100.44:4443")
TARANIS_USERNAME = "admin"
TARANIS_PASSWORD = "admin"

# 🔐 Authentification - récupérer le token JWT
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

# 📎 Ajouter les headers avec le token
def get_auth_headers():
    token = get_api_token()
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

# 🔍 GET /attributes
@content_bp.route('/attributes', methods=['GET'])
def get_attributes():
    headers = get_auth_headers()
    try:
        res = requests.get(f"{TARANIS_URL}/api/v1/config/attributes", headers=headers, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": f"Erreur get attributes : {str(e)}"}), 500

@content_bp.route('/report-item-types-simple', methods=['GET'])
def get_report_item_types_simple():
    headers = get_auth_headers()
    try:
        res = requests.get(f"{TARANIS_URL}/api/v1/config/report-item-types", headers=headers, verify=False)
        full_data = res.json()

        # On filtre uniquement les champs nécessaires pour la liste
        simplified_items = [
            {
                "id": item.get("id"),
                "title": item.get("title"),
                "description": item.get("description"),
                "subtitle": item.get("subtitle"),
                "tag": item.get("tag")
            }
            for item in full_data.get("items", [])
        ]

        return jsonify({
            "total_count": full_data.get("total_count", 0),
            "items": simplified_items
        }), res.status_code

    except Exception as e:
        return jsonify({"error": f"Erreur get report-item-types-simple : {str(e)}"}), 500


# 🔍 GET /report-item-types?search=
@content_bp.route('/report-item-types', methods=['GET'])
def get_report_item_types():
    headers = get_auth_headers()
    try:
        res = requests.get(f"{TARANIS_URL}/api/v1/config/report-item-types", headers=headers, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": f"Erreur get report-item-types : {str(e)}"}), 500
# 🔍 GET /report-item-types/<id>
@content_bp.route('/report-item-types/<int:item_id>', methods=['GET'])
def get_report_item_type_by_id(item_id):
    headers = get_auth_headers()
    try:
        res = requests.get(f"{TARANIS_URL}/api/v1/config/report-item-types/{item_id}", headers=headers, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": f"Erreur GET report-item-type {item_id} : {str(e)}"}), 500

# ➕ POST /report-item-types
@content_bp.route('/report-item-types', methods=['POST'])
def create_report_item_type():
    headers = get_auth_headers()
    try:
        payload = request.json
        res = requests.post(f"{TARANIS_URL}/api/v1/config/report-item-types", json=payload, headers=headers, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": f"Erreur POST report-item-type : {str(e)}"}), 500


# ✏️ PUT /report-item-types/<id>
@content_bp.route('/report-item-types/<int:item_id>', methods=['PUT'])
def update_report_item_type(item_id):
    headers = get_auth_headers()
    try:
        payload = request.json
        res = requests.put(f"{TARANIS_URL}/api/v1/config/report-item-types/{item_id}", json=payload, headers=headers, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": f"Erreur PUT report-item-type : {str(e)}"}), 500


# 🗑️ DELETE /report-item-types/<id>
@content_bp.route('/report-item-types/<int:item_id>', methods=['DELETE'])
def delete_report_item_type(item_id):
    headers = get_auth_headers()
    try:
        res = requests.delete(f"{TARANIS_URL}/api/v1/config/report-item-types/{item_id}", headers=headers, verify=False)
        return jsonify({"message": "Supprimé avec succès"}), res.status_code
    except Exception as e:
        return jsonify({"error": f"Erreur DELETE report-item-type : {str(e)}"}), 500

# 🔍 GET /word-lists?search=
@content_bp.route('/word-lists', methods=['GET'])
def get_word_lists():
    headers = get_auth_headers()
    try:
        res = requests.get(f"{TARANIS_URL}/api/v1/config/word-lists", headers=headers, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": f"Erreur get word-lists : {str(e)}"}), 500
