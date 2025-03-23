from flask_restful import Api
from controller.user_controller import UserRegistration, UserLogin, UserProfile, ResumeUpload


def initialize_routes(api: Api):
    api.add_resource(UserRegistration, '/register')
    api.add_resource(UserLogin, '/login')
    api.add_resource(UserProfile, '/profile')
    api.add_resource(ResumeUpload, '/resume/upload')

