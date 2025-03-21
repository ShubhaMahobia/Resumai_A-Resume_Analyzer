from flask import Flask,request, abort
from models.user import db,User
from flask_bcrypt import Bcrypt
from config import ApplicationConfig
from flask_cors import CORS
from flask_restful import Resource,Api
from flask_jwt_extended import create_access_token, JWTManager, get_jwt_identity,jwt_required

app = Flask(__name__)
app.config.from_object(ApplicationConfig)


# Initialize extensions
bcrypt = Bcrypt(app)
db.init_app(app)
api = Api(app=app)
jwt = JWTManager(app)
with app.app_context():
    db.create_all()

@app.route('/')
def test():
    return "Server is working"   


class UserRegistration(Resource):
    def post(self):
        data = request.get_json()
        fullName = data['fullName']
        password = data['password']
        email = data['email']

        if not fullName or not password:
            return{'Message' : 'Fill all the details'}
        if User.query.filter_by(email=email).first():
            return{'Message':'User already exist with this email.'}
        
        hash_pw = password=bcrypt.generate_password_hash(password)
        new_user = User(fullName=fullName,email=email,password=hash_pw)
        db.session.add(new_user)
        db.session.commit()
        return {'Message' : 'User created Successfully'},200
    

class UserLogin(Resource):
    def post(self):
        data = request.get_json()
        password = data['password']
        email = data['email']

        if not email or not password:
            return{'Message' : 'Fill all the details'}
        user_exist = User.query.filter_by(email=email).first()

        if user_exist and bcrypt.check_password_hash(user_exist.password, password):
            access_token = create_access_token(identity = user_exist.id)
            return {'access_token' : access_token},200            
    
        return {'Message' : 'Invalid Creds.'},401
    

class UserProfile(Resource):
    @jwt_required()
    def get(self):
        current_user_id = get_jwt_identity()
        return{
            'Message' : f'Current User id {current_user_id}'
        },200
    
api.add_resource(UserRegistration,'/register')
api.add_resource(UserLogin,'/login')
api.add_resource(UserProfile,'/profile')


if __name__ == "__main__":
    app.run(debug=True,port=5000)