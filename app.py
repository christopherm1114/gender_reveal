from flask import Flask, render_template, request, jsonify
import json
import os
from datetime import datetime

app = Flask(__name__)

# Archivo para guardar votos
VOTES_FILE = "votes.json"

def load_votes():
    if os.path.exists(VOTES_FILE):
        with open(VOTES_FILE, "r") as f:
            return json.load(f)
    return {"nino": 0, "nina": 0}

def save_votes(votes):
    with open(VOTES_FILE, "w") as f:
        json.dump(votes, f)

@app.route("/")
def index():
    votes = load_votes()
    total = votes["nino"] + votes["nina"]
    return render_template("index.html", votes=votes, total=total)

@app.route("/votar", methods=["POST"])
def votar():
    data = request.get_json()
    opcion = data.get("opcion")  # "nino" o "nina"
    if opcion not in ["nino", "nina"]:
        return jsonify({"error": "Opción inválida"}), 400
    votes = load_votes()
    votes[opcion] += 1
    save_votes(votes)
    total = votes["nino"] + votes["nina"]
    return jsonify({
        "nino": votes["nino"],
        "nina": votes["nina"],
        "total": total,
        "pct_nino": round((votes["nino"] / total) * 100) if total > 0 else 0,
        "pct_nina": round((votes["nina"] / total) * 100) if total > 0 else 0,
    })

@app.route("/votos")
def votos():
    votes = load_votes()
    total = votes["nino"] + votes["nina"]
    return jsonify({
        "nino": votes["nino"],
        "nina": votes["nina"],
        "total": total,
        "pct_nino": round((votes["nino"] / total) * 100) if total > 0 else 0,
        "pct_nina": round((votes["nina"] / total) * 100) if total > 0 else 0,
    })

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
