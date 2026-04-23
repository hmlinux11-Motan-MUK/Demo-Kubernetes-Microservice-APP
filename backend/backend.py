import os
import time
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from dotenv import load_dotenv

from DAO.db_object import PostgresDB
from DAO.cache_object import RedisCache
from auth import generate_token, token_required


load_dotenv()

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = "uploads"
ALLOWED_EXTENSIONS = {"png", "jpg", "jpeg", "gif", "webp"}

os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER


def allowed_file(filename):
    return "." in filename and filename.rsplit(".", 1)[1].lower() in ALLOWED_EXTENSIONS


def initialize_database(retries=10, delay=3):
    for attempt in range(1, retries + 1):
        try:
            db = PostgresDB()
            db.create_database()
            db.close_database()
            print("Database initialized successfully.")
            return
        except Exception as e:
            print(f"Database connection failed (attempt {attempt}/{retries}): {e}")
            time.sleep(delay)

    raise Exception("Could not connect to the database after multiple attempts.")


initialize_database()

@app.route("/login", methods=["POST"])
def login():
    data = request.get_json()

    username = data.get("username")
    password = data.get("password")

    if username == os.getenv("ADMIN_USERNAME") and password == os.getenv("ADMIN_PASSWORD"):
        token = generate_token(username)
        return jsonify({"token": token})

    return jsonify({"error": "Invalid credentials"}), 401


@app.route("/", methods=["GET"])
def home():
    return jsonify({"message": "Backend is running"})


@app.route("/home/", methods=["GET"])
def home_route():
    cache = RedisCache()
    cache_key = "featured_products"

    cached_data = cache.get(cache_key)
    if cached_data:
        print("Serving /home from Redis cache", flush=True)
        return jsonify(cached_data)
    else:
        print("Serving /home from DB", flush=True)

    db = PostgresDB()
    query = """
        SELECT product_id, product_title, product_image, product_name,
               product_price, product_availability, product_description, catid
        FROM productinfo
        LIMIT 4
    """
    rows = db.operation(query, res=1)
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

    response_data = {"products": products}
    cache.set(cache_key, response_data, ex=120)

    return jsonify(response_data)


@app.route("/uploads/<path:filename>", methods=["GET"])
def uploaded_file(filename):
    return send_from_directory(app.config["UPLOAD_FOLDER"], filename)


@app.route("/upload", methods=["POST"])
def upload_image():
    if "image" not in request.files:
        return jsonify({"error": "No image file provided"}), 400

    file = request.files["image"]

    if file.filename == "":
        return jsonify({"error": "No file selected"}), 400

    if not allowed_file(file.filename):
        return jsonify({"error": "Invalid file type"}), 400

    filename = secure_filename(file.filename)
    file_path = os.path.join(app.config["UPLOAD_FOLDER"], filename)
    file.save(file_path)

    return jsonify({
        "message": "Image uploaded successfully",
        "image_path": f"/uploads/{filename}"
    }), 200


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
    query = '''
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
    '''
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


@app.route("/products", methods=["GET"])
def get_products():
    page = request.args.get("page", 1)
    cache = RedisCache()
    cache_key = f"all_products_page_{page}"

    cached_data = cache.get(cache_key)
    if cached_data:
        print("Serving /products from Redis cache", flush=True)
        return jsonify(cached_data)
    else:
        print("Serving /products from DB", flush=True)

    db = PostgresDB()
    query = """
        SELECT product_id, product_title, product_image, product_name,
               product_price, product_availability, product_description, catid
        FROM productinfo
    """
    rows = db.operation(query, res=1)
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

    response_data = {
        "page": int(page),
        "pages": 1,
        "products": products
    }

    cache.set(cache_key, response_data, ex=120)

    return jsonify(response_data)


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=3000, debug=True)