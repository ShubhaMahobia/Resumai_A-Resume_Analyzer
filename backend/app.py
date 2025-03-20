from flask import Flask,request, session, abort
from flask.json import jsonify
from models.user import db,User
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from config import ApplicationConfig
from flask_session import Session
from flask_cors import CORS
from datetime import timedelta

app = Flask(__name__)
app.config.from_object(ApplicationConfig)
app.config.update(
    SESSION_COOKIE_SECURE=True,
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='Lax',
    PERMANENT_SESSION_LIFETIME=timedelta(days=7)
)

CORS(app, 
     resources={r"/*": {"origins": "http://localhost:5173"}},
     supports_credentials=True,
     allow_headers=["Content-Type", "Authorization"],
     expose_headers=["Content-Type", "Authorization"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])
bcrypt = Bcrypt(app=app)
server_session = Session(app=app)
db.init_app(app)

with app.app_context():
    db.create_all()

@app.route('/')
def test():
    return "Server is working"   

@app.route("/profile")
def getProfile():
    user_id = session.get("user_id")

    if not user_id:
        return jsonify({
            "error" : "Unauthorized"
        }), 401
    
    user = User.query.filter_by(id=user_id).first()
    if not user:
        return jsonify({
            "error" : "User not found"
        }), 404
        
    return jsonify({
        "id" : user.id,
        "email" : user.email
    })

@app.route("/logout", methods=["POST"])
def logout_user():
    session.clear()
    return jsonify({
        "message": "Logged out successfully"
    })

@app.route('/register',methods = ["POST"])
def register_user():
    email = request.json["email"]
    password = request.json["password"]

    user_exists = User.query.filter_by(email = email).first() is not None
    hash_pass = bcrypt.generate_password_hash(password=password)

    if user_exists:
        abort(409)
    
    new_user = User(email = email,password = hash_pass)
    db.session.add(new_user)
    db.session.commit()

    return jsonify({
        "id" : new_user.id,
        "email" : new_user.email
    })

@app.route('/login',methods=["POST"])
def login_user():
    email = request.json["email"]
    password = request.json["password"]

    user = User.query.filter_by(email = email).first()

    if user is None:
        return jsonify({
            "error" : "Unauthorized"
        }), 401
    
    if not bcrypt.check_password_hash(user.password,password=password):
         return jsonify({
            "error" : "Unauthorized"
        }), 401
    
    session["user_id"] = user.id
    session.permanent = True
    return jsonify({
        "id" : user.id,
        "email" : user.email
    })

if __name__ == "__main__":
    app.run(debug=True,port=5000)