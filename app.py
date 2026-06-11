from flask import Flask, render_template, request, jsonify
import os
import redis

app = Flask(__name__)

# Conexión a Redis (Upstash)
REDIS_URL = os.environ.get("REDIS_URL")
r = redis.from_url(REDIS_URL, decode_responses=True)

def load_votes():
    nino = int(r.get("votos:nino") or 0)
    nina = int(r.get("votos:nina") or 0)
    return {"nino": nino, "nina": nina}

def increment_vote(opcion):
    r.incr(f"votos:{opcion}")

def build_response(votes):
    total = votes["nino"] + votes["nina"]
    return {
        "nino": votes["nino"],
        "nina": votes["nina"],
        "total": total,
        "pct_nino": round((votes["nino"] / total) * 100) if total > 0 else 0,
        "pct_nina": round((votes["nina"] / total) * 100) if total > 0 else 0,
    }

@app.route("/")
def index():
    votes = load_votes()
    total = votes["nino"] + votes["nina"]
    return render_template("index.html", votes=votes, total=total)

@app.route("/votar", methods=["POST"])
def votar():
    data = request.get_json()
    opcion = data.get("opcion")
    if opcion not in ["nino", "nina"]:
        return jsonify({"error": "Opción inválida"}), 400
    increment_vote(opcion)
    votes = load_votes()
    return jsonify(build_response(votes))

@app.route("/votos")
def votos():
    votes = load_votes()
    return jsonify(build_response(votes))

if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0", port=5000)
