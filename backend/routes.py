from flask_restful import Api
from services.user_service import UserRegistration, UserLogin, UserProfile

def initialize_routes(api: Api):
    api.add_resource(UserRegistration, '/register')
    api.add_resource(UserLogin, '/login')
    api.add_resource(UserProfile, '/profile')
