import os
import time
from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
from functools import wraps
import jwt

from DAO.db_object import PostgresDB
from DAO.cache_object import RedisCache

load_dotenv()

SECRET_KEY = os.getenv("JWT_SECRET", "supersecretkey")

def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")

        if not auth_header.startswith("Bearer "):
            return jsonify({"error": "Token missing"}), 401

        token = auth_header.split(" ")[1]

        try:
            jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        except Exception:
            return jsonify({"error": "Invalid or expired token"}), 401

        return f(*args, **kwargs)

    return decorated

app = Flask(__name__)
CORS(
    app,
    resources={r"/*": {"origins": "*"}},
    allow_headers=["Content-Type", "Authorization"],
    methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"]
)

def initialize_database(retries=10, delay=3):
    for attempt in range(1, retries + 1):
        try:
            db = PostgresDB()
            db.create_database()
            db.close_database()
            print("Database initialized successfully.")
            return
        except Exception as e:
            print(f"Database connection failed ({attempt}/{retries}): {e}")
            time.sleep(delay)

    raise Exception("Could not connect to DB")

initialize_database()

@app.route("/", methods=["GET"])
def health():
    return jsonify({"message": "Product service is running"})

# ---------------- HOME ----------------
@app.route("/home/", methods=["GET"])
def home():
    cache = RedisCache()
    cache_key = "featured_products"

    cached_data = cache.get(cache_key)
    if cached_data:
        print("Serving /home from Redis", flush=True)
        return jsonify(cached_data)

    print("Serving /home from DB", flush=True)

    db = PostgresDB()
    rows = db.operation("""
        SELECT product_id, product_title, product_image, product_name,
               product_price, product_availability, product_description, catid
        FROM productinfo
        LIMIT 4
    """, res=1)
    db.close_database()

    products = []
    for row in rows:
        products.append({
            "product_ID": row[0],
            "product_title": row[1],
            "product_image": row[2],
            "product_name": row[3],
            "product_price": row[4],
            "product_availability": row[5],
            "product_description": row[6],
            "catid": row[7]
        })

    response = {"products": products}
    cache.set(cache_key, response, ex=120)

    return jsonify(response)

# ---------------- PRODUCTS ----------------
@app.route("/products", methods=["GET"])
def products():
    page = request.args.get("page", 1)
    cache = RedisCache()
    cache_key = f"all_products_page_{page}"

    cached_data = cache.get(cache_key)
    if cached_data:
        print("Serving /products from Redis", flush=True)
        return jsonify(cached_data)

    print("Serving /products from DB", flush=True)

    db = PostgresDB()
    rows = db.operation("""
        SELECT product_id, product_title, product_image, product_name,
               product_price, product_availability, product_description, catid
        FROM productinfo
    """, res=1)
    db.close_database()

    products = []
    for row in rows:
        products.append({
            "product_ID": row[0],
            "product_title": row[1],
            "product_image": row[2],
            "product_name": row[3],
            "product_price": row[4],
            "product_availability": row[5],
            "product_description": row[6],
            "catid": row[7]
        })

    response = {
        "page": int(page),
        "pages": 1,
        "products": products
    }

    cache.set(cache_key, response, ex=120)

    return jsonify(response)

# ---------------- ADD PRODUCT ----------------
@app.route("/add-product", methods=["POST"])
@token_required
def add_product():
    data = request.get_json()

    required_fields = [
        "product_ID",
        "product_title",
        "product_image",
        "product_name",
        "product_price",
        "product_availability",
        "product_description",
        "catid"
    ]

    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing field: {field}"}), 400

    db = PostgresDB()
    query = """
        INSERT INTO productinfo (
            product_ID,
            product_title,
            product_image,
            product_name,
            product_price,
            product_availability,
            product_description,
            catid
        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
    """
    values = (
        data["product_ID"],
        data["product_title"],
        data["product_image"],
        data["product_name"],
        data["product_price"],
        data["product_availability"],
        data["product_description"],
        data["catid"]
    )

    db.operation(query, values)
    db.close_database()

    cache = RedisCache()
    cache.delete("featured_products")
    cache.delete("all_products_page_1")

    return jsonify({"message": "Product added successfully"}), 201

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3002, debug=True)