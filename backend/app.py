from flask import Flask
from flask_bcrypt import Bcrypt
from config import ApplicationConfig
from flask_cors import CORS
from flask_restful import Api
from flask_jwt_extended import JWTManager
from models.models import db
from routes import initialize_routes
import os  # Import routes function

app = Flask(__name__)
app.config.from_object(ApplicationConfig)

CORS(app, supports_credentials=True, origins=["http://localhost:5173"])

UPLOAD_FOLDER = "static/uploads"
ALLOWED_EXTENSIONS = {"pdf", "docx"}
app.config["UPLOAD_FOLDER"] = UPLOAD_FOLDER
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Initialize extensions
bcrypt = Bcrypt(app)
db.init_app(app)
api = Api(app=app)
jwt = JWTManager(app)

with app.app_context():
    db.create_all()

# Initialize routes
initialize_routes(api)

if __name__ == "__main__":
    app.run(debug=True, port=5000)
