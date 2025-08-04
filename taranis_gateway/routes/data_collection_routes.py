from flask import Blueprint, jsonify, request
import requests
import os
import urllib3

data_collection = Blueprint('data_collection', __name__)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

TARANIS_URL = os.getenv("TARANIS_BASE_URL", "https://192.168.100.44:4443")
TARANIS_USERNAME = "admin"
TARANIS_PASSWORD = "admin"

# 🔐 Authentification et récupération du token
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

# Utilitaire pour construire les headers à chaque appel
def get_auth_headers():
    token = get_api_token()
    return {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }

@data_collection.route('/collectors', methods=['GET'])
def get_collector_nodes():
    headers = get_auth_headers()
    try:
        res = requests.get(f"{TARANIS_URL}/api/v1/config/collectors-nodes", headers=headers, verify=False)

        print("🔎 [DEBUG] Status code:", res.status_code)
        print("🔎 [DEBUG] Raw response text:", res.text)

        try:
            return jsonify(res.json()), res.status_code
        except Exception as json_error:
            return jsonify({
                "error": "Erreur de parsing JSON",
                "details": str(json_error),
                "status_code": res.status_code,
                "raw_text": res.text
            }), 500

    except Exception as e:
        return jsonify({"error": f"Erreur de connexion ou requête : {str(e)}"}), 500

# 2. POST Collector
@data_collection.route('/collectors', methods=['POST'])
def add_collector():
    headers = get_auth_headers()
    data = request.json
    res = requests.post(f"{TARANIS_URL}/api/v1/collectors", headers=headers, json=data, verify=False)
    return jsonify(res.json()), res.status_code

# 3. PUT Collector
@data_collection.route('/collectors/<collector_id>', methods=['PUT'])
def update_collector(collector_id):
    headers = get_auth_headers()
    data = request.json
    res = requests.put(f"{TARANIS_URL}/api/v1/collectors/{collector_id}", headers=headers, json=data, verify=False)
    return jsonify(res.json()), res.status_code

# 4. GET all OSINT Sources
@data_collection.route('/osint-sources', methods=['GET'])
def get_osint_sources():
    headers = get_auth_headers()
    res = requests.get(f"{TARANIS_URL}/api/v1/config/osint-sources", headers=headers, verify=False)
    return jsonify(res.json()), res.status_code


# 5. GET OSINT Source by ID (filtrage manuel car pas supporté par l'API Taranis)
@data_collection.route('/osint-sources/<source_id>', methods=['GET'])
def get_osint_source_by_id(source_id):
    headers = get_auth_headers()

    # Récupérer toutes les sources
    res = requests.get(f"{TARANIS_URL}/api/v1/config/osint-sources", headers=headers, verify=False)
    if res.status_code != 200:
        return jsonify({"error": "Failed to fetch OSINT sources"}), res.status_code

    all_sources = res.json()
    source = next((src for src in all_sources if src["id"] == source_id), None)

    if not source:
        return jsonify({"error": "OSINT source not found"}), 404

    # Récupérer les groupes disponibles
    groups = requests.get(f"{TARANIS_URL}/api/v1/config/osint-source-groups", headers=headers, verify=False).json()
    source['available_groups'] = groups

    # Récupérer les wordlists disponibles
    wordlists = requests.get(f"{TARANIS_URL}/api/v1/config/wordlists", headers=headers, verify=False).json()
    source['available_wordlists'] = wordlists

    return jsonify(source), 200


# 6. PUT OSINT Source
@data_collection.route('/osint-sources/<source_id>', methods=['PUT'])
def update_osint_source(source_id):
    headers = get_auth_headers()
    data = request.json

    # Assure que l'ID est inclus (même s'il sera écrasé côté Taranis)
    data['id'] = source_id

    res = requests.put(f"{TARANIS_URL}/api/v1/config/osint-sources/{source_id}", headers=headers, json=data, verify=False)
    return jsonify(res.json()), res.status_code


# 7. POST OSINT Source
@data_collection.route('/osint-sources', methods=['POST'])
def create_osint_source():
    headers = get_auth_headers()
    data = request.json

    # Injecte un faux ID si manquant pour satisfaire le constructor Python
    if 'id' not in data:
        data['id'] = "00000000-0000-0000-0000-000000000000"

    res = requests.post(f"{TARANIS_URL}/api/v1/config/osint-sources", headers=headers, json=data, verify=False)
    return jsonify(res.json()), res.status_code


# 8. DELETE OSINT Source
@data_collection.route('/osint-sources/<source_id>', methods=['DELETE'])
def delete_osint_source(source_id):
    headers = get_auth_headers()
    res = requests.delete(f"{TARANIS_URL}/api/v1/config/osint-sources/{source_id}", headers=headers, verify=False)
    if res.status_code == 204:
        return jsonify({"message": "OSINT source deleted"}), 200
    return jsonify({"error": "Failed to delete OSINT source"}), res.status_code

# 8. GET all OSINT Source Groups
@data_collection.route('/osint-source-groups', methods=['GET'])
def get_osint_source_groups():
    headers = get_auth_headers()
    res = requests.get(f"{TARANIS_URL}/api/v1/config/osint-source-groups", headers=headers, verify=False)
    return jsonify(res.json()), res.status_code


# 9. GET OSINT Source Group by ID (filtrage manuel)
@data_collection.route('/osint-source-groups/<group_id>', methods=['GET'])
def get_osint_source_group_by_id(group_id):
    headers = get_auth_headers()

    # Correction ici 👇
    res = requests.get(f"{TARANIS_URL}/api/v1/config/osint-source-groups", headers=headers, verify=False)
    if res.status_code != 200:
        return jsonify({"error": "Failed to fetch OSINT source groups"}), res.status_code

    all_groups = res.json().get("items", [])  # ✅ correction ici
    group = next((g for g in all_groups if isinstance(g, dict) and g.get("id") == group_id), None)

    if not group:
        return jsonify({"error": "OSINT source group not found"}), 404

    # Charger toutes les OSINT Sources disponibles (pour afficher en checkbox)
    all_sources = requests.get(f"{TARANIS_URL}/api/v1/config/osint-sources", headers=headers, verify=False).json()
    group["available_sources"] = all_sources

    return jsonify(group), 200


# 10. POST OSINT Source Group
@data_collection.route('/osint-source-groups', methods=['POST'])
def create_osint_source_group():
    headers = get_auth_headers()
    data = request.json

    if 'id' not in data:
        data['id'] = "00000000-0000-0000-0000-000000000001"  # valeur par défaut

    res = requests.post(f"{TARANIS_URL}/api/v1/config/osint-source-groups", headers=headers, json=data, verify=False)
    return jsonify(res.json()), res.status_code


# 11. PUT OSINT Source Group
@data_collection.route('/osint-source-groups/<group_id>', methods=['PUT'])
def update_osint_source_group(group_id):
    headers = get_auth_headers()
    data = request.json
    data["id"] = group_id  # S'assurer que l'id est dans le payload
    res = requests.put(f"{TARANIS_URL}/api/v1/config/osint-source-groups/{group_id}", headers=headers, json=data, verify=False)
    return jsonify(res.json()), res.status_code


# 12. DELETE OSINT Source Group
@data_collection.route('/osint-source-groups/<group_id>', methods=['DELETE'])
def delete_osint_source_group(group_id):
    headers = get_auth_headers()
    res = requests.delete(f"{TARANIS_URL}/api/v1/config/osint-source-groups/{group_id}", headers=headers, verify=False)
    if res.status_code == 204:
        return jsonify({"message": "OSINT source group deleted"}), 200
    return jsonify({"error": "Failed to delete OSINT source group"}), res.status_code
