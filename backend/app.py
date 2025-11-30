from flask import Flask, jsonify, request
from flask_cors import CORS
import mysql.connector
from dotenv import load_dotenv
import os
from mysql.connector import Error
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()

app = Flask(__name__)
CORS(app)

def get_db_connection():
    conn = mysql.connector.connect(
        host=os.getenv("DB_HOST", "localhost"),
        user=os.getenv("DB_USER", "root"),
        password=os.getenv("DB_PASSWORD", ""),
        database=os.getenv("DB_NAME", "expense_tracker"),
        port=os.getenv("DB_PORT", 3306),
    )
    return conn

@app.route("/")
def home():
    return jsonify({"message": "Expense Tracker backend running successfully!"})


@app.route("/api/health")
def health():
    return jsonify({"status": "ok"}), 200


@app.route("/api/users", methods=["GET"])
def get_users():
    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)
    cursor.execute("SELECT user_id, name, email, phone, created_at FROM users")
    users = cursor.fetchall()
    cursor.close()
    conn.close()
    return jsonify(users), 200

# Register a new user
@app.route("/api/register", methods=["POST"])
def register():
    data = request.get_json()

    name = data.get("name", "").strip()
    email = data.get("email", "").strip().lower()
    phone = data.get("phone", "").strip()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"ok": False, "error": "Email and password are required"}), 400

    password_hash = generate_password_hash(password)

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute("SELECT user_id FROM users WHERE email = %s", (email,))
        existing = cursor.fetchone()
        if existing:
            cursor.close()
            conn.close()
            return jsonify({"ok": False, "error": "Email already registered"}), 400

        insert_sql = """
            INSERT INTO users (name, email, phone, password_hash)
            VALUES (%s, %s, %s, %s)
        """
        cursor.execute(insert_sql, (name, email, phone, password_hash))
        conn.commit()

        new_user_id = cursor.lastrowid

        cursor.close()
        conn.close()

        return jsonify({
            "ok": True,
            "user": {
                "user_id": new_user_id,
                "name": name,
                "email": email,
                "phone": phone
            }
        }), 201

    except Exception as e:
        print("Register error:", e)
        conn.rollback()
        cursor.close()
        conn.close()
        return jsonify({"ok": False, "error": "Server error while registering"}), 500

# Login

@app.route("/api/login", methods=["POST"])
def login():
    data = request.get_json()

    email = data.get("email", "").strip().lower()
    password = data.get("password", "")

    if not email or not password:
        return jsonify({"ok": False, "error": "Email and password are required"}), 400

    conn = get_db_connection()
    cursor = conn.cursor(dictionary=True)

    try:
        cursor.execute(
            "SELECT user_id, name, email, phone, password_hash FROM users WHERE email = %s",
            (email,),
        )
        user = cursor.fetchone()
        cursor.close()
        conn.close()

        if not user:
            return jsonify({"ok": False, "error": "Invalid email or password"}), 401

        if not check_password_hash(user["password_hash"], password):
            return jsonify({"ok": False, "error": "Invalid email or password"}), 401

        user_data = {
            "user_id": user["user_id"],
            "name": user["name"],
            "email": user["email"],
            "phone": user["phone"],
        }

        return jsonify({"ok": True, "user": user_data}), 200

    except Exception as e:
        print("Login error:", e)
        cursor.close()
        conn.close()
        return jsonify({"ok": False, "error": "Server error while logging in"}), 500

# Expense & friends routes

@app.route("/api/friends/<int:user_id>", methods=["GET"])
def get_friends(user_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor(dictionary=True)

    cursor.execute(
        "SELECT user_id, name, email FROM users WHERE user_id != %s",
        (user_id,),
    )
    users = cursor.fetchall()

    cursor.execute(
        """
        SELECT 
            e.expense_id,
            e.payer_id,
            es.user_id   AS participant_id,
            es.owed_amount
        FROM expenses e
        JOIN expense_splits es ON e.expense_id = es.expense_id
        WHERE e.payer_id = %s OR es.user_id = %s
        """,
        (user_id, user_id),
    )
    rows = cursor.fetchall()

    cursor.close()
    conn.close()

    balances = {u["user_id"]: 0.0 for u in users}

    for row in rows:
        payer = row["payer_id"]
        participant = row["participant_id"]
        owed = float(row["owed_amount"])

        if payer == user_id and participant != user_id:
            balances[participant] += owed
        elif participant == user_id and payer != user_id:
            balances[payer] -= owed

    for u in users:
        u["balance"] = round(balances.get(u["user_id"], 0.0), 2)

    return jsonify(users), 200


@app.route("/api/expenses/<int:user_id>", methods=["GET"])
def get_expenses(user_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500

    cursor = conn.cursor(dictionary=True)

    try:
        query = """
            SELECT 
                e.expense_id,
                e.description,
                e.amount,
                e.expense_date,
                e.created_at,
                e.updated_at,
                e.payer_id,
                u.name AS payer_name,
                e.split_type,
                es.owed_amount,
                es.user_id
            FROM expenses e
            JOIN expense_splits es ON e.expense_id = es.expense_id
            JOIN users u ON e.payer_id = u.user_id
            WHERE e.created_by = %s OR es.user_id = %s
            ORDER BY e.created_at DESC
        """
        cursor.execute(query, (user_id, user_id))
        expenses = cursor.fetchall()
        return jsonify(expenses), 200

    except Exception as e:
        print("get_expenses error:", e)
        return jsonify({"error": "Server error loading expenses"}), 500

    finally:
        cursor.close()
        conn.close()


@app.route("/api/expenses", methods=["POST"])
def add_expense():
    data = request.get_json()

    created_by = data.get('created_by')
    payer_id = data.get('payer_id')
    description = data.get('description')
    amount = data.get('amount')
    split_type = data.get('split_type')
    expense_date = data.get('expense_date')
    participants = data.get('participants', [])

    if not all([created_by, payer_id, description, amount, split_type, expense_date]):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()

    try:
        cursor.execute("""
            INSERT INTO expenses (created_by, payer_id, description, amount, split_type, expense_date)
            VALUES (%s, %s, %s, %s, %s, %s)
        """, (created_by, payer_id, description, amount, split_type, expense_date))
        expense_id = cursor.lastrowid

        for p in participants:
            cursor.execute("""
                INSERT INTO expense_splits (expense_id, user_id, share_type, owed_amount)
                VALUES (%s, %s, %s, %s)
            """, (expense_id, p['user_id'], p.get('share_type', 'equal'), p['owed_amount']))

        conn.commit()
        return jsonify({"message": "Expense added successfully!", "expense_id": expense_id}), 201

    except Error as e:
        conn.rollback()
        print("Error adding expense:", e)
        return jsonify({"error": str(e)}), 500

    finally:
        cursor.close()
        conn.close()

@app.route("/api/expenses/<int:expense_id>", methods=["PUT"])
def update_expense(expense_id):
    data = request.get_json()

    created_by = data.get('created_by')
    payer_id = data.get('payer_id')
    description = data.get('description')
    amount = data.get('amount')
    split_type = data.get('split_type')
    expense_date = data.get('expense_date')
    participants = data.get('participants', [])

    if not all([created_by, payer_id, description, amount, split_type, expense_date]):
        return jsonify({"error": "Missing required fields"}), 400

    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()

    try:
        cursor.execute("""
            UPDATE expenses
            SET created_by=%s, payer_id=%s, description=%s, amount=%s, split_type=%s, expense_date=%s
            WHERE expense_id=%s
        """, (created_by, payer_id, description, amount, split_type, expense_date, expense_id))

        cursor.execute("DELETE FROM expense_splits WHERE expense_id=%s", (expense_id,))
        for p in participants:
            cursor.execute("""
                INSERT INTO expense_splits (expense_id, user_id, share_type, owed_amount)
                VALUES (%s, %s, %s, %s)
            """, (expense_id, p['user_id'], p.get('share_type', 'equal'), p['owed_amount']))

        conn.commit()
        return jsonify({"message": "Expense updated successfully!"}), 200

    except Error as e:
        conn.rollback()
        print("Error updating expense:", e)
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

@app.route("/api/expenses/<int:expense_id>", methods=["DELETE"])
def delete_expense(expense_id):
    conn = get_db_connection()
    if not conn:
        return jsonify({"error": "Database connection failed"}), 500
    cursor = conn.cursor()

    try:
        cursor.execute("DELETE FROM expense_splits WHERE expense_id=%s", (expense_id,))
        cursor.execute("DELETE FROM expenses WHERE expense_id=%s", (expense_id,))
        conn.commit()
        return jsonify({"message": "Expense deleted"}), 200
    except Error as e:
        conn.rollback()
        print("Error deleting expense:", e)
        return jsonify({"error": str(e)}), 500
    finally:
        cursor.close()
        conn.close()

# Run the server

if __name__ == "__main__":
    app.run(debug=True, host="127.0.0.1", port=5000)
