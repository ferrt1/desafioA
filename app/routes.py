from flask import render_template, jsonify, request
from app import app
import json
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

LEVELS_FILE = os.path.join(BASE_DIR, "levels.json")


@app.route('/')
def index():
    return render_template('index.html')

@app.route('/form')
def form():
    return render_template('form.html')

@app.route('/get_levels')
def get_levels():

    if os.path.exists(LEVELS_FILE):
        try:
            with open(LEVELS_FILE, "r", encoding="utf-8") as file:
                levels = json.load(file)
            return jsonify(levels)
        except json.JSONDecodeError:
            return jsonify({"error": "El archivo JSON está corrupto."}), 500
    else:
        return jsonify({"error": "El archivo de niveles no existe."}), 404



@app.route('/update_levels', methods=['POST'])
def update_levels():

    try:
        new_level = request.get_json()

        if new_level.get("password") != "admin123":
            return jsonify({"error": "Contraseña incorrecta."}), 403

        if not new_level.get("titulo"):
            return jsonify({"error": "El título es obligatorio."}), 400

        if not new_level.get("items") or any(not item["texto"] or not item["categoria"] for item in new_level["items"]):
            return jsonify({"error": "Todos los items deben tener texto y categoría."}), 400

        if not new_level.get("boxes") or any(not box["id"] or not box["texto"] for box in new_level["boxes"]):
            return jsonify({"error": "Todos los boxes deben tener un ID y texto."}), 400

        if not new_level.get("hints") or any(not hint for hint in new_level["hints"]):
            return jsonify({"error": "Todas las pistas deben tener texto."}), 400

        if os.path.exists(LEVELS_FILE):
            with open(LEVELS_FILE, "r", encoding="utf-8") as file:
                try:
                    levels = json.load(file)
                except json.JSONDecodeError:
                    levels = {} 
        else:
            levels = {}

        new_level.pop("password")  
        new_id = str(len(levels) + 1)
        levels[new_id] = new_level 

        with open(LEVELS_FILE, "w", encoding="utf-8") as file:
            json.dump(levels, file, indent=4, ensure_ascii=False)

        return jsonify({"message": f"Nivel {new_id} agregado correctamente."}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500