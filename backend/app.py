
from flask import Flask,request, session
from flask.json import jsonify
from models.user import db,User
from flask_bcrypt import Bcrypt
from flask_sqlalchemy import SQLAlchemy
from config import ApplicationConfig
from flask_session import Session

app = Flask(__name__)
app.config.from_object(ApplicationConfig)
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
        })
    
    user = User.query.filter_by(id=user_id).first()
    return jsonify({
        "id" : user.id,
        "email" : user.email
    })


@app.route("/logout")
def logout_user():
    session.clear()


@app.route('/register',methods = ["POST"])
def register_user():
    email = request.json["email"]
    password = request.json["password"]

    user_exists = User.query.filter_by(email = email).first() is not None
    hash_pass = bcrypt.generate_password_hash(password=password)


    if user_exists:
        return jsonify({
            "error" : "Email id already exsits"
        })
    
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
        })
    
    if not bcrypt.check_password_hash(user.password,password=password):
         return jsonify({
            "error" : "Unauthorized"
        })
    
    session["user_id"] = user.id    
    return jsonify({
        "id" : user.id,
        "email" : user.email
    })
 


if __name__ == "__main__":
    app.run(debug=True,port=5000)