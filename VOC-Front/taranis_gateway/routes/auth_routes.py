from flask import Blueprint, request, jsonify
import requests, os

auth_bp = Blueprint('auth', __name__)

TARANIS_API = os.getenv("TARANIS_API_URL")
API_KEY = os.getenv("TARANIS_API_KEY")

@auth_bp.route('/auth/login', methods=['POST'])
def login():
    response = requests.post(f"{TARANIS_API}/auth/login", json=request.json, verify=False)
    return jsonify(response.json()), response.status_code
