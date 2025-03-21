from flask import request
from flask_restful import Resource
from flask_bcrypt import Bcrypt
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from models.user import db, User

bcrypt = Bcrypt()

class UserRegistration(Resource):
    def post(self):
        data = request.get_json()
        fullName = data.get('fullName')
        password = data.get('password')
        email = data.get('email')

        if not fullName or not password or not email:
            return {'Message': 'Fill all the details'}, 400
        if User.query.filter_by(email=email).first():
            return {'Message': 'User already exists with this email.'}, 400

        hash_pw = bcrypt.generate_password_hash(password).decode('utf-8')
        new_user = User(fullName=fullName, email=email, password=hash_pw)
        db.session.add(new_user)
        db.session.commit()
        return {'Message': 'User created Successfully'}, 201

class UserLogin(Resource):
    def post(self):
        data = request.get_json()
        password = data.get('password')
        email = data.get('email')

        if not email or not password:
            return {'Message': 'Fill all the details'}, 400

        user_exist = User.query.filter_by(email=email).first()

        if user_exist and bcrypt.check_password_hash(user_exist.password, password):
            access_token = create_access_token(identity=user_exist.id)
            return {'access_token': access_token}, 200

        return {'Message': 'Invalid Credentials'}, 401

class UserProfile(Resource):
    @jwt_required()
    def get(self):
        current_user_id = get_jwt_identity()
        return {'Message': f'Current User ID: {current_user_id}'}, 200
