from flask import Blueprint, jsonify, request
import requests
import os
import urllib3

presenters_bp = Blueprint('presenters', __name__)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

TARANIS_URL = os.getenv("TARANIS_BASE_URL", "https://192.168.100.44:4443")
TARANIS_USERNAME = "admin"
TARANIS_PASSWORD = "admin"

# Authentification : récupérer le token
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

# Headers pour les appels API Taranis
def get_auth_headers():
    token = get_api_token()
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

# 🔍 GET /presenters-nodes
@presenters_bp.route('/presenters-nodes', methods=['GET'])
def get_presenters_nodes():
    headers = get_auth_headers()
    try:
        res = requests.get(f"{TARANIS_URL}/api/v1/config/presenters-nodes", headers=headers, verify=False)
        return jsonify(res.json()), res.status_code
    except Exception as e:
        return jsonify({"error": f"Erreur get presenters-nodes : {str(e)}"}), 500

# 🔹 1. GET all Product Types
@presenters_bp.route('/product-types', methods=['GET'])
def get_product_types():
    headers = get_auth_headers()
    res = requests.get(f"{TARANIS_URL}/api/v1/config/product-types", headers=headers, verify=False)
    return jsonify(res.json()), res.status_code

# 🔹 2. GET Product Type by ID (filtrage manuel)
@presenters_bp.route('/product-types/<type_id>', methods=['GET'])
def get_product_type_by_id(type_id):
    headers = get_auth_headers()
    res = requests.get(f"{TARANIS_URL}/api/v1/config/product-types", headers=headers, verify=False)
    if res.status_code != 200:
        return jsonify({"error": "Failed to fetch product types"}), res.status_code

    all_types = res.json().get("items", [])
    item = next((pt for pt in all_types if str(pt["id"]) == str(type_id)), None)

    if not item:
        return jsonify({"error": "Product type not found"}), 404

    # Optionnel : enrichir avec presenters disponibles
    presenters = requests.get(f"{TARANIS_URL}/api/v1/config/presenters-nodes", headers=headers, verify=False).json()
    item["available_presenters"] = presenters

    return jsonify(item), 200

# 🔹 3. POST Product Type
@presenters_bp.route('/product-types', methods=['POST'])
def create_product_type():
    headers = get_auth_headers()
    data = request.json

    # Vérification d'unicité du titre (title)
    existing = requests.get(f"{TARANIS_URL}/api/v1/config/product-types", headers=headers, verify=False)
    if existing.status_code == 200:
        for pt in existing.json().get("items", []):
            # Vérifie que chaque item est un dict et qu'il contient 'title'
            if isinstance(pt, dict) and "title" in pt:
                if pt["title"].strip().lower() == data["title"].strip().lower():
                    return jsonify({"error": f"Title '{data['title']}' already exists."}), 409

    # Requête POST vers Taranis pour créer le product type
    res = requests.post(f"{TARANIS_URL}/api/v1/config/product-types", headers=headers, json=data, verify=False)
    return jsonify(res.json()), res.status_code

# 🔹 4. PUT Product Type
@presenters_bp.route('/product-types/<type_id>', methods=['PUT'])
def update_product_type(type_id):
    headers = get_auth_headers()
    data = request.json
    data['id'] = int(type_id)  # assure que l'id est bien présent

    res = requests.put(f"{TARANIS_URL}/api/v1/config/product-types/{type_id}", headers=headers, json=data, verify=False)
    return jsonify(res.json()), res.status_code

# 🔹 5. DELETE Product Type
@presenters_bp.route('/product-types/<type_id>', methods=['DELETE'])
def delete_product_type(type_id):
    headers = get_auth_headers()
    res = requests.delete(f"{TARANIS_URL}/api/v1/config/product-types/{type_id}", headers=headers, verify=False)
    if res.status_code == 204:
        return jsonify({"message": "Product type deleted"}), 200
    return jsonify({"error": "Failed to delete product type"}), res.status_code
