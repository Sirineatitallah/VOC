from flask import Blueprint, request, jsonify, Response
import requests
import os
import urllib3

publish_bp = Blueprint('publish', __name__)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

TARANIS_URL = os.getenv("TARANIS_BASE_URL", "https://192.168.100.44:4443")
TARANIS_API = f"{TARANIS_URL}/api/v1"
TARANIS_USERNAME = "admin"
TARANIS_PASSWORD = "admin"

# Auth automatique
def get_api_token():
    login_url = f"{TARANIS_API}/auth/login"
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

# === ROUTES PRODUITS ===

# 1. GET all products
@publish_bp.route('/publish/products', methods=['GET'])
def get_products():
    r = requests.get(f"{TARANIS_API}/publish/products?search=&range=ALL&sort=DATE_DESC&offset=0&limit=20", headers=get_auth_headers(), verify=False)
    return jsonify(r.json()), r.status_code

# 2. POST create new product
# 6. POST général vers /publish/products
@publish_bp.route('/publish/products/create', methods=['POST'])
def post_general_product():
    payload = request.get_json()

    try:
        r = requests.post(
            f"{TARANIS_API}/publish/products",
            headers=get_auth_headers(),
            json=payload,
            verify=False
        )
        print(f"[DEBUG] Payload reçu: {payload}")
        print(f"[DEBUG] Code retour Taranis: {r.status_code}")
        print(f"[DEBUG] Réponse: {r.text}")

        # Retourne la réponse brute ou message par défaut
        if r.text.strip():
            return jsonify(r.json()), r.status_code
        else:
            return jsonify({"message": "Produit publié avec succès."}), r.status_code
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# 3. PUT update existing product

# 3. PUT update existing product
@publish_bp.route('/publish/products/<int:product_id>', methods=['PUT'])
def update_product(product_id):
    payload = request.get_json()
    print(f"[DEBUG] Payload reçu: {payload}")
    
    r = requests.put(f"{TARANIS_API}/publish/products/{product_id}", headers=get_auth_headers(), json=payload, verify=False)
    print(f"[DEBUG] Code retour Taranis: {r.status_code}")
    print(f"[DEBUG] Contenu réponse: {r.text}")
    
    # Gestion d'erreur améliorée
    if r.status_code == 401:
        return jsonify({"error": "Authentication failed. Please check credentials."}), 401
    
    try:
        if r.text.strip():
            return jsonify(r.json()), r.status_code
        else:
            return jsonify({"message": "Product updated successfully", "status": "success"}), r.status_code
    except Exception as e:
        return jsonify({
            "error": "Invalid response from Taranis API",
            "status_code": r.status_code,
            "raw_response": r.text[:200] if r.text else "Empty response"
        }), 500

# 5. POST publish product using publisher preset
@publish_bp.route('/publish/products/<int:product_id>/publish/<preset_id>', methods=['POST'])
def publish_product_with_preset(product_id, preset_id):
    url = f"{TARANIS_API}/publish/products/{product_id}/publishers/{preset_id}"
    r = requests.post(url, headers=get_auth_headers(), verify=False)
    
    print(f"[DEBUG] Publish URL: {url}")
    print(f"[DEBUG] Code retour Taranis: {r.status_code}")
    print(f"[DEBUG] Contenu réponse: {r.text}")
    
    # Gestion d'erreur améliorée
    if r.status_code == 401:
        return jsonify({"error": "Authentication failed. Please check credentials."}), 401
    
    try:
        if r.text.strip():
            return jsonify(r.json()), r.status_code
        else:
            return jsonify({"message": f"Product published with preset {preset_id}", "status": "success"}), r.status_code
    except Exception as e:
        return jsonify({
            "error": "Invalid response from Taranis API",
            "status_code": r.status_code,
            "raw_response": r.text[:200] if r.text else "Empty response"
        }), 500
# 4. DELETE product
@publish_bp.route('/publish/products/<int:product_id>', methods=['DELETE'])
def delete_product(product_id):
    r = requests.delete(f"{TARANIS_API}/publish/products/{product_id}", headers=get_auth_headers(), verify=False)
    return jsonify({"message": "Product deleted"}), r.status_code

