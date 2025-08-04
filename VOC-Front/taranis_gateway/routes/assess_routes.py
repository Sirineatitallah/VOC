# routes/assess_routes.py

from flask import Blueprint, jsonify
import requests
import os
import logging
from routes.access_control_routes import get_auth_headers

# Init blueprint
assess_bp = Blueprint("assess", __name__)

# Disable SSL verification warning
requests.packages.urllib3.disable_warnings()

# Env
TARANIS_URL = os.getenv("TARANIS_BASE_URL", "https://192.168.100.44:4443")
GROUP_ID_VULNERABILITIES = "8f63a699-23e1-4568-ad4b-4f495ba24d85"

@assess_bp.route("/api/assess/vulnerabilities", methods=["GET"])
def get_vulnerability_assess_items():
    headers = get_auth_headers()
    if not headers:
        return jsonify({"error": "Échec d'authentification sur Taranis"}), 401

    try:
        url = f"{TARANIS_URL}/api/v1/assess/news-item-aggregates-by-group/{GROUP_ID_VULNERABILITIES}"
        params = {
            "limit": 50000,     # Très large limite
            "range": "ALL"
        }
        resp = requests.get(url, headers=headers, params=params, verify=False, timeout=60)
        resp.raise_for_status()
        items = resp.json().get("items", [])
        return jsonify({"total": len(items), "items": items}), 200
    except Exception as e:
        logging.error(f"❌ Erreur récupération massive : {e}")
        return jsonify({"error": "Erreur lors de la récupération des items"}), 500
