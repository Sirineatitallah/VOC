from flask import Blueprint, request, jsonify
import requests
import os
import urllib3

# Blueprint
analyze_bp = Blueprint('analyze', __name__)
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

# === Configuration ===
TARANIS_URL = os.getenv("TARANIS_BASE_URL", "https://192.168.100.44:4443")
TARANIS_API = f"{TARANIS_URL}/api/v1"
TARANIS_USERNAME = "admin"
TARANIS_PASSWORD = "admin"

# === Auth automatique ===
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

# === ROUTES ===

# 1. Liste des report items
@analyze_bp.route('/analyze/report-items', methods=['GET'])
def get_report_items():
    r = requests.get(f"{TARANIS_API}/analyze/report-items", headers=get_auth_headers(), verify=False)
    return jsonify(r.json()), r.status_code

# 2. Détail d’un report item
@analyze_bp.route('/analyze/report-items/<int:item_id>', methods=['GET'])
def get_report_item_detail(item_id):
    r = requests.get(f"{TARANIS_API}/analyze/report-items/{item_id}", headers=get_auth_headers(), verify=False)
    return jsonify(r.json()), r.status_code

# 3. Liste des types de report items
@analyze_bp.route('/analyze/report-item-types', methods=['GET'])
def get_report_item_types():
    r = requests.get(f"{TARANIS_API}/analyze/report-item-types", headers=get_auth_headers(), verify=False)
    return jsonify(r.json()), r.status_code

# 4. Création d’un nouveau report item
@analyze_bp.route('/analyze/report-items', methods=['POST'])
def create_report_item():
    payload = request.get_json()
    r = requests.post(f"{TARANIS_API}/analyze/report-items", headers=get_auth_headers(), json=payload, verify=False)
    return jsonify(r.json()), r.status_code

# 4.bis. Mise à jour d’un report item existant
@analyze_bp.route('/analyze/report-items/<int:item_id>', methods=['PUT'])
def update_report_item(item_id):
    payload = request.get_json()
    headers = get_auth_headers()
    r = requests.put(
        f"{TARANIS_API}/analyze/report-items/{item_id}",
        headers=headers,  # ✅ utilise la variable déjà définie
        json=payload,
        verify=False
    )
    return jsonify(r.json()), r.status_code
@analyze_bp.route('/analyze/report-items/<int:item_id>/field-locks/<field>/unlock', methods=['PUT'])
def unlock_field(item_id, field):
    r = requests.put(
        f"{TARANIS_API}/analyze/report-items/{item_id}/field-locks/{field}/unlock",
        headers=get_auth_headers(),
        verify=False
    )
    return jsonify({"message": f"Field '{field}' unlocked."}), r.status_code


# 6. Suppression d’un report item par ID
@analyze_bp.route('/analyze/report-items/<int:item_id>', methods=['DELETE'])
def delete_report_item(item_id):
    r = requests.delete(
        f"{TARANIS_API}/analyze/report-items/{item_id}",
        headers=get_auth_headers(),
        verify=False
    )
    return jsonify({"message": "Report item deleted successfully"}), r.status_code


# 5. News items d’un groupe
@analyze_bp.route('/assess/news-item-aggregates-by-group/<group_id>', methods=['GET'])
def get_news_item_aggregates(group_id):
    params = {
        "search": request.args.get("search", ""),
        "read": request.args.get("read", "false"),
        "important": request.args.get("important", "false"),
        "relevant": request.args.get("relevant", "false"),
        "in_analyze": request.args.get("in_analyze", "false"),
        "range": request.args.get("range", "ALL"),
        "sort": request.args.get("sort", "DATE_DESC"),
        "offset": request.args.get("offset", 0),
        "limit": request.args.get("limit", 20)
    }
    r = requests.get(
        f"{TARANIS_API}/assess/news-item-aggregates-by-group/{group_id}",
        headers=get_auth_headers(),
        params=params,
        verify=False
    )
    return jsonify(r.json()), r.status_code
