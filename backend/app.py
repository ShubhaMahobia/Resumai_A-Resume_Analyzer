from flask import Flask
from flask_bcrypt import Bcrypt
from config import ApplicationConfig
from flask_cors import CORS
from flask_restful import Api
from flask_jwt_extended import JWTManager
from models.models import db
from routes import initialize_routes
import os  # Import routes function
from flask_mail import Mail  # Import Flask-Mail
import os

app = Flask(__name__)
app.config.from_object(ApplicationConfig)

# More permissive CORS settings for development
CORS(app, resources={
    r"/*": {
        "origins": "*", 
        "allow_headers": "*", 
        "expose_headers": "*", 
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"]
    }
})

# Extra CORS configuration for specific endpoints that might need it
@app.after_request
def after_request(response):
    response.headers.add('Access-Control-Allow-Origin', '*')
    response.headers.add('Access-Control-Allow-Headers', 'Content-Type,Authorization')
    response.headers.add('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS')
    return response


# Initialize extensions
bcrypt = Bcrypt(app)
db.init_app(app)
api = Api(app=app)
jwt = JWTManager(app)
mail = Mail(app)  # Initialize Flask-Mail

with app.app_context():
    db.create_all()

# Initialize routes
initialize_routes(api)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
