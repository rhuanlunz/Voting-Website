from flask              import Flask, request, render_template, jsonify, send_file
from flask_limiter      import Limiter
from flask_limiter.util import get_remote_address
from hashlib            import sha512
from PIL                import Image, ImageDraw
from uuid               import uuid4, UUID
from threading          import Thread
from json               import loads
from time               import sleep
from pathlib            import Path

import qrcode
import sqlite3

app = Flask(__name__)
limiter = Limiter(
    app=app,
    key_func=get_remote_address,
    default_limits=["10/minute"],
)

password = sha512("test".encode("utf-8")).hexdigest()
lock = False
def delete_qr(file: str) -> None:
    try:
        sleep(3)
        Path(file).unlink()
    except FileNotFoundError:
        return
    except Exception as e:
        print(e)
    return

@app.errorhandler(Exception)
def handler_429(error):
    if request.path == '/ch':
        return render_template("error.html", error_code=404), 404

    error_code = 500
    if hasattr(error, 'code'):
        error_code = error.code

    return render_template("error.html", error_code=error_code), error_code

@app.route("/selection", methods=["GET", "POST"])
def selection():
    if request.method == "POST":
        data = request.json
        id = int(data.get("id"))
        token = data.get("token")
        global lock

        # Check if it's a valid UUID
        try:
            token = str(token)
            UUID(token)
        except ValueError:
            return jsonify("Invalid token"), 400

        database = sqlite3.connect("database.db")
        cursor = database.cursor()

        # Check if the token exists
        result = cursor.execute('SELECT * FROM Tokens WHERE token = ?', (token,)).fetchall()
        if len(result) == 0:
            return jsonify("Invalid token"), 400

        if not lock:
            cursor.execute('UPDATE Tokens SET vote = ? WHERE token = ?', (id, token))

            database.commit()
            database.close()
            return '', 200
        return '', 403

    return render_template("selection.html")

@app.route("/generator", methods=["GET", "POST"])
@limiter.limit("1/3second, 1000 per day", methods=["POST"])
def generator():
    if request.method == "POST":
        data = request.json
        global lock

        if data.get("password") == password and not lock:
            uuid = str(uuid4())

            if not Path("tmp").exists():
                Path("tmp").mkdir()

            file = f"tmp/{uuid}.png"

            database = sqlite3.connect("database.db")
            cursor = database.cursor()

            result = cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='Tokens'").fetchone()
            if result is None:
                cursor.execute("CREATE TABLE Tokens (token varchar(12), vote int)")
            cursor.execute("INSERT INTO Tokens VALUES (?, ?)", (uuid, -1))

            database.commit()
            database.close()

            # Generate the QRCode
            qr = qrcode.QRCode(
                version = 1,
                error_correction = qrcode.constants.ERROR_CORRECT_L,
                box_size = 1,
                border = 1,
            )
            qr.add_data(request.url_root + 'selection?token=' + str(uuid))
            qr.make(fit=True)
            qr = qr.make_image(fill_color="#11380B", back_color="#A5D395")
            qr = qr.resize((300, 300), Image.NEAREST)
            qr.save(file)

            Thread(target=delete_qr, args=(file,)).start()

            return send_file(file, mimetype="image/png")
        return '', 403
    return render_template("generator.html")

# Used to return projects list
@app.route("/projects", methods=["GET"])
def get_projects():
    with open("projects.json", 'r', encoding="utf-8") as f:
        projects = loads(f.read())
    return jsonify(projects), 200

# Used to validate user login in generator page
@app.route("/validate", methods=["POST"])
@limiter.limit("5/minute")
def validate():
    if request.method == "POST":
        data = request.json
        if data.get("password") == password:
            return '', 200
    return '', 403

# Change the voting lock state
@app.route("/ch", methods=["POST", "GET"])
@limiter.limit("1/30seconds")
def change_lock():
    if request.method == "POST":
        data = request.json
        if data.get("password") == password:
            global lock
            lock = not lock
            return '', 200
    return '', 404
