import os
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

from auth import generate_token

load_dotenv()

app = Flask(__name__)
CORS(app)


@app.route("/", methods=["GET"])
def health():
    return jsonify({"message": "Auth service is running"})


@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    if not data:
        return jsonify({"error": "Invalid request body"}), 400

    username = data.get("username")
    password = data.get("password")

    if username == os.getenv("ADMIN_USERNAME") and password == os.getenv("ADMIN_PASSWORD"):
        token = generate_token(username)
        return jsonify({"token": token}), 200

    return jsonify({"error": "Invalid credentials"}), 401


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3001, debug=True)